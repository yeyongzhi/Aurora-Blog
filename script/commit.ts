/**
 * 交互式 Git 提交脚本
 *
 * 流程：
 * 1. 检查是否有未 push 的 commit → 提示是否先 push
 * 2. 检查是否有未 commit 的改动 → 没有则退出
 * 3. git add . 暂存所有文件
 * 4. 选择提交类型 + 输入 message → 执行 git commit
 */

import { execSync } from "node:child_process";
import { writeFileSync, unlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import readline from "node:readline";
import { select } from "@inquirer/prompts";

// ==================== ANSI 终端颜色 ====================

const color = {
  reset: "\x1b[0m",
  green: (text: string) => `\x1b[32m${text}\x1b[0m`,
  yellow: (text: string) => `\x1b[33m${text}\x1b[0m`,
  red: (text: string) => `\x1b[31m${text}\x1b[0m`,
  cyan: (text: string) => `\x1b[36m${text}\x1b[0m`,
  bold: (text: string) => `\x1b[1m${text}\x1b[0m`,
};

// ==================== Git 操作封装 ====================

/** 执行 git 命令，返回去除了首尾空白的输出（静默 stderr） */
function git(cmd: string): string {
  return execSync(`git ${cmd}`, {
    encoding: "utf-8",
    stdio: ["pipe", "pipe", "pipe"],
  }).trim();
}

/** 执行 git 命令并返回是否成功（不抛出异常） */
function gitSilent(cmd: string): { success: boolean; output: string } {
  try {
    const output = execSync(`git ${cmd}`, {
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "pipe"],
    }).trim();
    return { success: true, output };
  } catch {
    return { success: false, output: "" };
  }
}

// ==================== 提交类型定义 ====================

interface CommitType {
  emoji: string;
  label: string;
  value: string;
}

const COMMIT_TYPES: CommitType[] = [
  { emoji: "✨️", label: "功能开发、迭代", value: "feature" },
  { emoji: "🐞", label: "BUG修复", value: "fix" },
  { emoji: "🎨", label: "样式调整", value: "style" },
  { emoji: "🌀", label: "重构", value: "refactor" },
  { emoji: "⚡️", label: "添加、修改测试", value: "test" },
  { emoji: "📦️", label: "架构、依赖调整", value: "build" },
  { emoji: "🧪", label: "性能优化", value: "perf" },
  { emoji: "🌐", label: "CI配置、脚本变更", value: "ci" },
  { emoji: "📝", label: "文档更新", value: "docs" },
  { emoji: "🔧", label: "杂项", value: "chore" },
  { emoji: "⏪️", label: "回滚", value: "revert" },
];

// ==================== 多行输入 ====================

/** 采集多行输入，空行确认完成 */
async function collectMultilineInput(prompt: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  console.log(color.cyan(`\n? ${prompt}`));
  console.log(color.yellow("  (↵ Enter 换行，空行 + Enter 完成输入)"));
  console.log(color.yellow("第1行输入标题  后续行输入内容)\n"));

  const lines: string[] = [];

  return new Promise<string>((resolve) => {
    const askLine = () => {
      rl.question(`  ${String(lines.length + 1).padStart(2, " ")} │ `, (line) => {
        if (line === "") {
          if (lines.length === 0) {
            console.log(color.red("  ⚠ 提交信息不能为空，请至少输入一行"));
            askLine();
          } else {
            rl.close();
            resolve(lines.join("\n"));
          }
        } else {
          lines.push(line);
          askLine();
        }
      });
    };
    askLine();
  });
}

// ==================== 主流程 ====================

async function main() {
  // 设置环境变量，标记本次提交流程来自 pnpm run commit
  // .husky/pre-commit hook 会检查这个变量，拒绝手动 git commit
  process.env.GIT_COMMIT_FROM_SCRIPT = "true";

  console.log(color.cyan("\n📋 Git 交互式提交\n"));

  // ---------- 步骤 1：检查未 push 的 commit ----------

  const currentBranch = gitSilent("branch --show-current");
  let hasUnpushed = false;

  if (currentBranch.success && currentBranch.output) {
    // 用 @{push} 对比当前 HEAD，检查是否有未推送的提交
    const ahead = gitSilent(
      `rev-list --count @{push}..HEAD 2>/dev/null`
    );
    if (ahead.success && Number(ahead.output) > 0) {
      hasUnpushed = true;
      const logResult = gitSilent(
        `log @{push}..HEAD --oneline --no-decorate`
      );
      const unpushedList = logResult.success
        ? logResult.output
            .split("\n")
            .map((line) => `    ${line}`)
            .join("\n")
        : `    ${color.yellow("（无法获取详细列表）")}`;

      console.log(
        color.yellow(
          `⚠️  当前分支 ${currentBranch.output} 有 ${ahead.output} 个未推送的 commit：`
        )
      );
      console.log(unpushedList);
      console.log("");

      // 用 @inquirer/prompts 的 select 来询问是否 push
      const shouldPush = await select({
        message: "是否先推送（push）这些 commit？",
        choices: [
          { name: "是 — 先 push 再继续提交流程", value: "yes" },
          { name: "否 — 跳过 push，直接继续提交流程", value: "no" },
        ],
      });

      if (shouldPush === "yes") {
        console.log(color.cyan("\n📤 正在 push...\n"));
        try {
        //   const pushResult = execSync("git push", {
        //     encoding: "utf-8",
        //     stdio: "inherit",
        //   });
          console.log(color.green("\n✅ Push 成功！\n"));
        } catch {
          console.log(color.red("\n❌ Push 失败，请手动处理。提交已取消。\n"));
          process.exit(1);
        }
      } else {
        console.log(color.yellow("\n⏭️  跳过 push，继续提交流程。\n"));
      }
    }
  }

  // ---------- 步骤 2：检查是否有未 commit 的改动 ----------

  const statusResult = gitSilent("status --porcelain");

  if (!statusResult.success || statusResult.output === "") {
    // working tree 完全干净且没有 unpushed commit
    if (!hasUnpushed) {
      console.log(color.green("✅ 工作区干净，当前暂无任何改动。\n"));
    }
    // 如果只有 unpushed 但已经 push 完了（或跳过），且没有新改动
    // 并且刚才已经处理过 push，这里不需要再退出
    process.exit(0);
  }

  // 统计改动文件数
  const changedFiles = statusResult.output.split("\n").filter(Boolean);
  console.log(
    color.cyan(`📂 检测到 ${changedFiles.length} 个文件有改动：`)
  );

  // 区分 staged / unstaged / untracked 并展示
  const staged = changedFiles.filter(
    (f) => !f.startsWith(" ") && !f.startsWith("??")
  );
  const unstaged = changedFiles.filter((f) => f.startsWith(" "));
  const untracked = changedFiles.filter((f) => f.startsWith("??"));

  void [
    { label: "已暂存 (staged)", list: staged, colorFn: color.green },
    { label: "未暂存 (unstaged)", list: unstaged, colorFn: color.yellow },
    { label: "未跟踪 (untracked)", list: untracked, colorFn: color.red },
  ].forEach(({ label, list, colorFn }) => {
    if (list.length > 0) {
      console.log(colorFn(`  ${label} (${list.length} 个)：`));
      list.forEach((f) => {
        // 去掉 git status porcelain 格式的前两个字符状态位
        const filename = f.slice(3).trim();
        console.log(`    - ${filename}`);
      });
    }
  });
  console.log("");

  // ---------- 步骤 3：git add . + 交互式提交 ----------

  console.log(color.cyan("📦 正在暂存所有文件 (git add .)...\n"));
  git("add .");

  // 选择提交类型
  const chosenType = await select({
    message: "请选择本次提交的类型：",
    choices: COMMIT_TYPES.map((t) => ({
      name: `[${t.emoji}] ${t.label}`,
      value: t,
    })),
    pageSize: 11, // 一次性显示全部选项，避免滚动
  });

  // 多行输入提交信息
  const commitMessage = await collectMultilineInput("请输入本次提交的 message：");

  // 第一行带类型前缀，后续行作为 git commit body（空行分隔，符合 git 规范）
  const messageLines = commitMessage.trim().split("\n");
  const firstLine = `${chosenType.emoji} ${chosenType.value}: ${messageLines[0]}`;
  const fullMessage =
    messageLines.length > 1
      ? `${firstLine}\n\n${messageLines.slice(1).join("\n")}`
      : firstLine;

  console.log("");
  console.log(color.cyan("📝 提交信息预览："));
  fullMessage.split("\n").forEach((line) => console.log(`  ${line}`));
  console.log("");

  // 确认提交
  const shouldCommit = await select({
    message: `本次共准备提交 ${changedFiles.length} 个文件，确认是否要提交？`,
    choices: [
      { name: "是 (y) — 确认提交", value: "yes" },
      { name: "否 (n) — 取消提交，回滚暂存区", value: "no" },
    ],
  });

  if (shouldCommit === "no") {
    console.log(color.yellow("\n⏭️  已取消提交，正在回滚暂存区..."));
    gitSilent("reset HEAD");
    console.log(color.yellow("✅ 暂存区已恢复。\n"));
    process.exit(0);
  }

  // 通过临时文件写入 message，避免 Windows 命令行多行转义问题
  const tmpFile = join(tmpdir(), `git-commit-msg-${Date.now()}.txt`).replace(/\\/g, "/");
  try {
    writeFileSync(tmpFile, fullMessage, "utf-8");
    execSync(`git commit -F "${tmpFile}"`, {
      encoding: "utf-8",
      stdio: "inherit",
    });
    console.log(color.green("\n🎉 已全部提交成功！\n"));
  } catch {
    console.log(color.red("\n❌ 提交失败，已取消。暂存区已恢复。\n"));
    gitSilent("reset HEAD");
    process.exit(1);
  } finally {
    try { unlinkSync(tmpFile); } catch { /* 临时文件清理失败不影响主流程 */ }
  }
}

main().catch((err) => {
  console.error(color.red(`\n❌ 脚本执行出错：${err.message}\n`));
  process.exit(1);
});
