import { spawnSync } from 'node:child_process';
import { stdin as input, stdout as output } from 'node:process';
import { createInterface } from 'node:readline/promises';
import pc from 'picocolors';

type CommitType = {
  value: string;
  label: string;
  description: string;
};

type StatusEntry = {
  raw: string;
  indexStatus: string;
  worktreeStatus: string;
  path: string;
};

type PushTarget = {
  args: string[];
  label: string;
};

const COMMIT_TYPES: CommitType[] = [
  { value: 'feat', label: '功能开发', description: '新增功能或页面能力' },
  { value: 'fix', label: '问题修复', description: '修复 bug 或异常行为' },
  { value: 'docs', label: '文档更新', description: '修改文档、注释或说明' },
  { value: 'style', label: '样式优化', description: '样式、格式、UI 微调' },
  { value: 'refactor', label: '代码重构', description: '重构实现但不改变功能' },
  { value: 'perf', label: '性能优化', description: '提升性能或减少开销' },
  { value: 'test', label: '测试相关', description: '新增或调整测试' },
  { value: 'build', label: '构建调整', description: '构建脚本或依赖流程变更' },
  { value: 'chore', label: '杂项维护', description: '杂项更新、清理或维护' },
  { value: 'ci', label: '持续集成', description: 'CI/CD 配置调整' },
  { value: 'revert', label: '回滚提交', description: '回滚历史提交' },
];

const CONFLICT_STATUSES = new Set(['DD', 'AU', 'UD', 'UA', 'DU', 'AA', 'UU']);

const rl = createInterface({ input, output });

function printTitle(message: string) {
  console.log(`\n${pc.bold(pc.cyan(message))}`);
}

function printInfo(message: string) {
  console.log(pc.white(message));
}

function printSuccess(message: string) {
  console.log(pc.green(message));
}

function printWarning(message: string) {
  console.log(pc.yellow(message));
}

function printError(message: string) {
  console.error(pc.red(message));
}

function runGit(args: string[], inherit = false): string {
  const result = spawnSync('git', args, {
    encoding: 'utf8',
    stdio: inherit ? 'inherit' : 'pipe',
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    const outputMessage = [result.stderr, result.stdout]
      .filter(Boolean)
      .join('\n')
      .trim();

    throw new Error(outputMessage || `git ${args.join(' ')} 执行失败`);
  }

  return (result.stdout ?? '').trim();
}

function getStatusEntries(): StatusEntry[] {
  const statusOutput = runGit(['status', '--porcelain']);

  if (!statusOutput) {
    return [];
  }

  return statusOutput
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => ({
      raw: line,
      indexStatus: line[0] ?? ' ',
      worktreeStatus: line[1] ?? ' ',
      path: line.slice(3).trim(),
    }));
}

function hasConflicts(entries: StatusEntry[]): boolean {
  return entries.some((entry) =>
    CONFLICT_STATUSES.has(`${entry.indexStatus}${entry.worktreeStatus}`),
  );
}

function hasStagedChanges(entries: StatusEntry[]): boolean {
  return entries.some(
    (entry) => !entry.raw.startsWith('??') && entry.indexStatus !== ' ',
  );
}

function hasUnstagedChanges(entries: StatusEntry[]): boolean {
  return entries.some(
    (entry) => entry.raw.startsWith('??') || entry.worktreeStatus !== ' ',
  );
}

function gitAddAll() {
  printInfo(pc.dim('$ git add --all'));
  runGit(['add', '--all'], true);
}

function getCurrentBranch(): string | null {
  try {
    const branch = runGit(['rev-parse', '--abbrev-ref', 'HEAD']);
    return branch === 'HEAD' ? null : branch;
  } catch {
    return null;
  }
}

function getPushTarget(): PushTarget | null {
  const currentBranch = getCurrentBranch();

  if (!currentBranch) {
    return null;
  }

  try {
    const upstream = runGit([
      'rev-parse',
      '--abbrev-ref',
      '--symbolic-full-name',
      '@{u}',
    ]);

    return {
      args: ['push'],
      label: upstream,
    };
  } catch {
    const remotes = runGit(['remote'])
      .split(/\r?\n/)
      .map((item) => item.trim())
      .filter(Boolean);

    if (!remotes.length) {
      return null;
    }

    const remote = remotes.includes('origin') ? 'origin' : remotes[0];

    return {
      args: ['push', '-u', remote, currentBranch],
      label: `${remote}/${currentBranch}（首次设置上游分支）`,
    };
  }
}

async function askYesNo(question: string, defaultValue = true): Promise<boolean> {
  const suffix = defaultValue ? '[Y/n]' : '[y/N]';

  while (true) {
    const answer = (await rl.question(
      pc.yellow(`${question} ${suffix} `),
    )).trim();

    if (!answer) {
      return defaultValue;
    }

    const normalized = answer.toLowerCase();

    if (['y', 'yes', '1', '是'].includes(normalized)) {
      return true;
    }

    if (['n', 'no', '0', '否'].includes(normalized)) {
      return false;
    }

    printWarning('请输入 y / n。');
  }
}

async function chooseCommitType(): Promise<CommitType> {
  printTitle('选择 Commit 类型');
  COMMIT_TYPES.forEach((type, index) => {
    console.log(
      `${pc.cyan(`${index + 1}. ${type.value}`)} ${pc.white(type.label)} ${pc.dim(
        `- ${type.description}`,
      )}`,
    );
  });

  while (true) {
    const answer = (await rl.question(pc.yellow('\n请输入类型编号: '))).trim();
    const selectedIndex = Number(answer) - 1;

    if (Number.isInteger(selectedIndex) && COMMIT_TYPES[selectedIndex]) {
      return COMMIT_TYPES[selectedIndex];
    }

    printWarning('编号无效，请重新输入。');
  }
}

async function inputCommitMessage(type: CommitType): Promise<string> {
  while (true) {
    const message = (await rl.question(
      pc.yellow(`请输入提交说明（将生成 ${type.value}: xxx）: `),
    )).trim();

    if (message) {
      return `${type.value}: ${message}`;
    }

    printWarning('提交说明不能为空。');
  }
}

async function handleAddStep() {
  printTitle('检查 Git 状态');

  const entries = getStatusEntries();

  if (!entries.length) {
    printWarning('当前工作树是干净的，没有可提交内容。');
    process.exit(0);
  }

  if (hasConflicts(entries)) {
    printError('检测到冲突文件，请先手动解决冲突后再提交。');
    process.exit(1);
  }

  const staged = hasStagedChanges(entries);
  const unstaged = hasUnstagedChanges(entries);

  printInfo(`已暂存文件: ${staged ? pc.green('是') : pc.dim('否')}`);
  printInfo(`未暂存文件: ${unstaged ? pc.yellow('是') : pc.dim('否')}`);

  if (staged && !unstaged) {
    printSuccess('当前已有暂存内容，直接进入 commit。');
    return;
  }

  if (!staged && unstaged) {
    printInfo('检测到未暂存改动，准备自动执行 git add --all。');
    gitAddAll();
    return;
  }

  if (staged && unstaged) {
    const shouldAddAll = await askYesNo(
      '检测到同时存在已暂存和未暂存文件，是否将剩余改动也一并 add？',
      true,
    );

    if (shouldAddAll) {
      gitAddAll();
    } else {
      printInfo('将仅提交当前已暂存的内容。');
    }

    return;
  }

  printWarning('没有检测到可提交的暂存内容。');
  process.exit(0);
}

async function handleCommitStep() {
  const type = await chooseCommitType();
  const commitMessage = await inputCommitMessage(type);

  printTitle('执行 Git Commit');
  printInfo(`提交信息: ${pc.green(commitMessage)}`);
  printInfo(pc.dim(`$ git commit -m "${commitMessage}"`));

  runGit(['commit', '-m', commitMessage], true);
}

async function handlePushStep() {
  printTitle('准备 Push');

  const pushTarget = getPushTarget();

  if (!pushTarget) {
    printWarning('未检测到可用的远程分支信息，请手动执行 git push。');
    return;
  }

  const shouldPush = await askYesNo(
    `是否推送到 ${pushTarget.label}？`,
    false,
  );

  if (!shouldPush) {
    printInfo('已跳过 push。');
    return;
  }

  printInfo(pc.dim(`$ git ${pushTarget.args.join(' ')}`));
  runGit(pushTarget.args, true);
  printSuccess('Push 完成。');
}

async function main() {
  printTitle('Git 提交流程');

  await handleAddStep();
  await handleCommitStep();
  await handlePushStep();

  printSuccess('\n全部流程已完成。');
}

process.on('SIGINT', () => {
  rl.close();
  printWarning('\n操作已取消。');
  process.exit(1);
});

try {
  await main();
  rl.close();
} catch (error) {
  rl.close();
  const message = error instanceof Error ? error.message : '发生未知错误';
  printError(message);
  process.exit(1);
}
