import { spawnSync } from 'node:child_process';
import { stdin as input, stdout as output } from 'node:process';
import { emitKeypressEvents } from 'node:readline';
import { createInterface } from 'node:readline/promises';
import pc from 'picocolors';

type CommitType = {
  emoji: string;
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
  { emoji: '✨', value: 'feat', label: '功能开发', description: '新增功能或页面能力' },
  { emoji: '🐛', value: 'fix', label: '问题修复', description: '修复 bug 或异常行为' },
  { emoji: '📝', value: 'docs', label: '文档更新', description: '修改文档、注释或说明' },
  { emoji: '🎨', value: 'style', label: '样式优化', description: '样式、格式、UI 微调' },
  { emoji: '♻️', value: 'refactor', label: '代码重构', description: '重构实现但不改变功能' },
  { emoji: '⚡', value: 'perf', label: '性能优化', description: '提升性能或减少开销' },
  { emoji: '🏗️', value: 'build', label: '构建调整', description: '构建脚本或依赖流程变更' },
  { emoji: '🔧', value: 'chore', label: '杂项维护', description: '杂项更新、清理或维护' },
  { emoji: '🤖', value: 'ci', label: '持续集成', description: 'CI/CD 配置调整' },
  { emoji: '⏪️', value: 'revert', label: '回滚提交', description: '回滚历史提交' },
];

const CONFLICT_STATUSES = new Set(['DD', 'AU', 'UD', 'UA', 'DU', 'AA', 'UU']);

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

async function askQuestion(question: string): Promise<string> {
  const rl = createInterface({ input, output });

  try {
    return await rl.question(question);
  } finally {
    rl.close();
  }
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
    const answer = (await askQuestion(pc.yellow(`${question} ${suffix} `))).trim();

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

function renderCommitTypeMenu(selectedIndex: number): number {
  const lines = [
    '',
    pc.bold(pc.cyan('选择 Commit 类型')),
    pc.dim('使用 ↑ / ↓ 切换，按 Enter 确认'),
    ...COMMIT_TYPES.map((type, index) => {
      const isActive = index === selectedIndex;
      const prefix = isActive ? pc.green('❯') : pc.dim(' ');
      const typeText = `${type.emoji} ${type.value}`;
      const detail = `${type.label}【${type.description}】`;

      return `${prefix} ${isActive ? pc.green(typeText) : pc.white(typeText)} ${pc.dim(detail)}`;
    }),
  ];

  output.write(`\r${lines.join('\n')}\n`);
  return lines.length;
}

function clearRenderedLines(lineCount: number) {
  for (let index = 0; index < lineCount; index += 1) {
    output.write('\x1b[2K');

    if (index < lineCount - 1) {
      output.write('\x1b[1A');
    }
  }

  output.write('\r');
}

async function chooseCommitType(): Promise<CommitType> {
  if (!input.isTTY || !output.isTTY) {
    throw new Error('当前终端不支持上下键选择，请在交互式终端中运行。');
  }

  return await new Promise<CommitType>((resolve, reject) => {
    let selectedIndex = 0;
    let renderedLines = 0;

    const cleanup = () => {
      input.off('keypress', onKeypress);
      input.setRawMode(false);
      output.write('\x1b[?25h');
    };

    const rerender = () => {
      if (renderedLines > 0) {
        clearRenderedLines(renderedLines);
      }

      renderedLines = renderCommitTypeMenu(selectedIndex);
    };

    const onKeypress = (_value: string, key: { ctrl?: boolean; name?: string }) => {
      if (key.ctrl && key.name === 'c') {
        cleanup();
        reject(new Error('操作已取消'));
        return;
      }

      if (key.name === 'up') {
        selectedIndex =
          (selectedIndex - 1 + COMMIT_TYPES.length) % COMMIT_TYPES.length;
        rerender();
        return;
      }

      if (key.name === 'down') {
        selectedIndex = (selectedIndex + 1) % COMMIT_TYPES.length;
        rerender();
        return;
      }

      if (key.name === 'return') {
        clearRenderedLines(renderedLines);
        cleanup();
        printInfo(
          `已选择类型: ${pc.green(`${COMMIT_TYPES[selectedIndex].emoji} ${COMMIT_TYPES[selectedIndex].value}`)}`,
        );
        resolve(COMMIT_TYPES[selectedIndex]);
      }
    };

    emitKeypressEvents(input);
    input.setRawMode(true);
    output.write('\x1b[?25l');
    input.on('keypress', onKeypress);
    rerender();
  });
}

async function inputCommitMessage(type: CommitType): Promise<string> {
  while (true) {
    const message = (
      await askQuestion(
        pc.yellow(`请输入提交说明（将生成 ${type.emoji}${type.value}: xxx）: `),
      )
    ).trim();

    if (message) {
      return `${type.emoji}${type.value}: ${message}`;
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

  const shouldPush = await askYesNo(`是否推送到 ${pushTarget.label}？`, false);

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
  printWarning('\n操作已取消。');
  process.exit(1);
});

try {
  await main();
} catch (error) {
  const message = error instanceof Error ? error.message : '发生未知错误';
  printError(message);
  process.exit(1);
}
