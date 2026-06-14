import type { Bot, Context, NextFunction } from "grammy";
import { config } from "../../config.js";
import { ttsCommand } from "../commands/tts-command.js";
import { opencodeStartCommand } from "../commands/opencode-start-command.js";
import { opencodeStopCommand } from "../commands/opencode-stop-command.js";
import { projectsCommand } from "../commands/projects-command.js";
import { worktreeCommand } from "../commands/worktree-command.js";
import { openCommand } from "../commands/open-command.js";
import { lsCommand } from "../commands/ls-command.js";
import { sessionsCommand } from "../commands/sessions-command.js";
import { messagesCommand } from "../commands/messages-command.js";
import { newCommand } from "../commands/new-command.js";
import { abortCommand } from "../commands/abort-command.js";
import { detachCommand } from "../commands/detach-command.js";
import { taskCommand } from "../commands/task-command.js";
import { taskListCommand } from "../commands/tasklist-command.js";
import { renameCommand } from "../commands/rename-command.js";
import { commandsCommand } from "../commands/command-catalog-command.js";
import { skillsCommand } from "../commands/skills-catalog-command.js";
import { mcpsCommand } from "../commands/mcp-catalog-command.js";
import { startCommand } from "../commands/start-command.js";
import { helpCommand } from "../commands/help-command.js";
import { statusCommand } from "../commands/status-command.js";
import { BOT_COMMANDS } from "../commands/definitions.js";
import { logger } from "../../utils/logger.js";

interface CommandRouterDeps {
  ensureEventSubscription: (directory: string) => Promise<void>;
}

let commandsInitialized = false;

export async function ensureCommandsInitialized(ctx: Context, next: NextFunction): Promise<void> {
  if (commandsInitialized || !ctx.from || ctx.from.id !== config.telegram.allowedUserId) {
    await next();
    return;
  }

  if (!ctx.chat) {
    logger.warn("[Bot] Cannot initialize commands: chat context is missing");
    await next();
    return;
  }

  try {
    await ctx.api.setMyCommands(BOT_COMMANDS, {
      scope: {
        type: "chat",
        chat_id: ctx.chat.id,
      },
    });

    commandsInitialized = true;
    logger.debug(`[Bot] Commands initialized for authorized user (chat_id=${ctx.chat.id})`);
  } catch (err) {
    logger.error("[Bot] Failed to set commands:", err);
  }

  await next();
}

function isGroupChat(ctx: Context): boolean {
  return ctx.chat?.type === "group" || ctx.chat?.type === "supergroup";
}

function isBotMentioned(ctx: Context): boolean {
  const botInfo = ctx.me;
  if (!botInfo?.username) {
    return false;
  }

  const text = ctx.message?.text || ctx.message?.caption || "";
  const mentionEntity = `@${botInfo.username.toLowerCase()}`;

  if (text.toLowerCase().includes(mentionEntity)) {
    return true;
  }

  const entities = ctx.message?.entities || ctx.message?.caption_entities || [];
  return entities.some(
    (e) =>
      (e.type === "mention" && text.substring(e.offset, e.offset + e.length).toLowerCase() === mentionEntity) ||
      (e.type === "text_mention" && e.user?.id === botInfo.id),
  );
}

function groupCommandGuard(ctx: Context, next: () => Promise<void>): Promise<void> {
  if (isGroupChat(ctx) && !isBotMentioned(ctx)) {
    logger.debug(`[Bot] Ignoring group command without @mention: chatId=${ctx.chat?.id}`);
    return Promise.resolve();
  }
  return next();
}

export function registerCommandRouter(bot: Bot<Context>, deps: CommandRouterDeps): void {
  bot.command("start", groupCommandGuard, startCommand);
  bot.command("help", groupCommandGuard, helpCommand);
  bot.command("status", groupCommandGuard, statusCommand);
  bot.command("tts", groupCommandGuard, ttsCommand);
  bot.command("mimocode_start", groupCommandGuard, opencodeStartCommand);
  bot.command("mimocode_stop", groupCommandGuard, opencodeStopCommand);
  bot.command("projects", groupCommandGuard, projectsCommand);
  bot.command("worktree", groupCommandGuard, worktreeCommand);
  bot.command("open", groupCommandGuard, openCommand);
  bot.command("ls", groupCommandGuard, lsCommand);
  bot.command("sessions", groupCommandGuard, sessionsCommand);
  bot.command("messages", groupCommandGuard, messagesCommand);
  bot.command("new", groupCommandGuard, (ctx) => newCommand(ctx, { bot, ensureEventSubscription: deps.ensureEventSubscription }));
  bot.command("abort", groupCommandGuard, abortCommand);
  bot.command("detach", groupCommandGuard, detachCommand);
  bot.command("task", groupCommandGuard, taskCommand);
  bot.command("tasklist", groupCommandGuard, taskListCommand);
  bot.command("rename", groupCommandGuard, renameCommand);
  bot.command("commands", groupCommandGuard, commandsCommand);
  bot.command("skills", groupCommandGuard, skillsCommand);
  bot.command("mcps", groupCommandGuard, mcpsCommand);
}
