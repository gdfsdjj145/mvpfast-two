// mcp/server.ts
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { z } from "zod";
import http from "http";
import {
  getTechStack,
  formatTechStack,
  getTechStackSummary,
  TechStack,
} from "./scanner.js";

const PORT = 8886;

// 创建 MCP 服务器
const server = new McpServer({
  name: "mvpfast-mcp",
  version: "1.0.0",
});

// ============================================
// 项目扫描工具
// ============================================

/**
 * 获取项目技术栈 - 返回完整的技术栈对象
 */
server.tool(
  "get_tech_stack",
  "扫描并获取项目的完整技术栈信息，包括框架、语言、前端、后端、数据库等配置。在使用任何 skill 之前应先调用此工具了解项目上下文。",
  {
    format: z
      .enum(["json", "text", "summary"])
      .default("json")
      .describe("输出格式：json（完整对象）、text（可读文本）、summary（简短摘要）"),
    refresh: z
      .boolean()
      .default(false)
      .describe("是否强制刷新缓存，重新扫描项目"),
  },
  async ({ format, refresh }) => {
    const techStack = getTechStack(refresh);

    let content: string;

    switch (format) {
      case "text":
        content = formatTechStack(techStack);
        break;
      case "summary":
        content = getTechStackSummary(techStack);
        break;
      case "json":
      default:
        content = JSON.stringify(techStack, null, 2);
        break;
    }

    return {
      content: [
        {
          type: "text",
          text: content,
        },
      ],
    };
  }
);

/**
 * 获取项目结构 - 返回目录结构信息
 */
server.tool(
  "get_project_structure",
  "获取项目的目录结构信息，了解项目的文件组织方式",
  {},
  async () => {
    const techStack = getTechStack();
    const structure = techStack.structure;

    const existingDirs = Object.entries(structure)
      .filter(([, exists]) => exists)
      .map(([dir]) => dir);

    const structureInfo = {
      rootDirs: existingDirs,
      hasAppRouter: structure.app,
      hasPagesRouter: structure.pages,
      hasComponents: structure.components,
      hasLib: structure.lib,
      hasHooks: structure.hooks,
      hasModels: structure.models,
      hasServices: structure.services,
      hasStore: structure.store,
      hasTypes: structure.types,
      hasI18n: structure.i18n,
      hasPrisma: structure.prisma,
      hasContent: structure.content,
      hasMcp: structure.mcp,
      hasTests: structure.tests,
      configFiles: techStack.configFiles,
    };

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(structureInfo, null, 2),
        },
      ],
    };
  }
);

/**
 * 获取框架信息
 */
server.tool(
  "get_framework_info",
  "获取项目使用的框架和版本信息",
  {},
  async () => {
    const techStack = getTechStack();

    const frameworkInfo = {
      framework: techStack.framework,
      language: techStack.language,
      frontend: techStack.frontend,
      backend: techStack.backend,
    };

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(frameworkInfo, null, 2),
        },
      ],
    };
  }
);

/**
 * 检查功能是否可用
 */
server.tool(
  "check_feature",
  "检查项目中某个功能是否已配置/可用",
  {
    feature: z
      .enum([
        "i18n",
        "auth",
        "database",
        "testing",
        "docs",
        "docker",
        "animation",
        "ui-library",
      ])
      .describe("要检查的功能"),
  },
  async ({ feature }) => {
    const techStack = getTechStack();

    let result: { enabled: boolean; details: string };

    switch (feature) {
      case "i18n":
        result = {
          enabled: techStack.i18n.enabled,
          details: techStack.i18n.enabled
            ? `使用 ${techStack.i18n.library}，支持语言：${techStack.i18n.locales.join(", ")}`
            : "未配置国际化",
        };
        break;

      case "auth":
        result = {
          enabled: techStack.backend.auth !== "none",
          details:
            techStack.backend.auth !== "none"
              ? `使用 ${techStack.backend.auth}`
              : "未配置认证",
        };
        break;

      case "database":
        result = {
          enabled: techStack.backend.orm !== "none",
          details:
            techStack.backend.orm !== "none"
              ? `数据库：${techStack.backend.database}，ORM：${techStack.backend.orm}`
              : "未配置数据库",
        };
        break;

      case "testing":
        result = {
          enabled: techStack.testing.enabled,
          details: techStack.testing.enabled
            ? `使用 ${techStack.testing.framework}`
            : "未配置测试框架",
        };
        break;

      case "docs":
        result = {
          enabled: techStack.docs.enabled,
          details: techStack.docs.enabled
            ? `使用 ${techStack.docs.library}`
            : "未配置文档系统",
        };
        break;

      case "docker":
        result = {
          enabled: techStack.deployment.docker,
          details: techStack.deployment.docker
            ? "已配置 Docker"
            : "未配置 Docker",
        };
        break;

      case "animation":
        result = {
          enabled: !!techStack.frontend.animation,
          details: techStack.frontend.animation || "未配置动画库",
        };
        break;

      case "ui-library":
        result = {
          enabled: techStack.frontend.ui !== "none",
          details:
            techStack.frontend.ui !== "none"
              ? `UI 库：${techStack.frontend.ui}`
              : "未配置 UI 库",
        };
        break;

      default:
        result = {
          enabled: false,
          details: "未知功能",
        };
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  }
);

/**
 * 获取开发建议
 */
server.tool(
  "get_dev_recommendations",
  "基于当前技术栈获取开发建议和最佳实践",
  {
    task: z
      .enum([
        "add-page",
        "add-api",
        "add-component",
        "add-model",
        "add-hook",
        "optimize-ui",
        "add-test",
      ])
      .describe("要执行的开发任务"),
  },
  async ({ task }) => {
    const techStack = getTechStack();

    const recommendations: Record<string, string[]> = {
      "add-page": [
        `页面位置：src/app/[local]/[page-name]/page.tsx`,
        `使用 ${techStack.framework.router}`,
        techStack.i18n.enabled
          ? `支持国际化，默认语言：${techStack.i18n.defaultLocale}`
          : "",
        `样式：使用 ${techStack.frontend.css.join(" + ")} 和 ${techStack.frontend.ui}`,
        techStack.frontend.animation
          ? `动画：可使用 ${techStack.frontend.animation}`
          : "",
      ].filter(Boolean),

      "add-api": [
        `API 位置：src/app/api/[endpoint]/route.ts`,
        `使用 Next.js Route Handlers`,
        techStack.backend.orm !== "none"
          ? `数据库操作：使用 ${techStack.backend.orm}`
          : "",
        `认证：${techStack.backend.auth}`,
      ].filter(Boolean),

      "add-component": [
        `组件位置：src/components/[category]/[ComponentName].tsx`,
        `使用 ${techStack.language.name}`,
        `样式：${techStack.frontend.ui} + Tailwind CSS`,
        techStack.frontend.icons ? `图标：${techStack.frontend.icons}` : "",
      ].filter(Boolean),

      "add-model": [
        `Schema 位置：prisma/schema.prisma`,
        `Model 位置：src/models/[model].ts`,
        `数据库：${techStack.backend.database}`,
        `ORM：${techStack.backend.orm}`,
        `运行 npx prisma generate 生成客户端`,
      ].filter(Boolean),

      "add-hook": [
        `Hook 位置：src/hooks/use[HookName].ts`,
        `使用 ${techStack.language.name}`,
        `遵循 React Hooks 规范`,
      ],

      "optimize-ui": [
        `UI 库：${techStack.frontend.ui}`,
        `CSS：${techStack.frontend.css.join(", ")}`,
        techStack.frontend.animation
          ? `动画：${techStack.frontend.animation}`
          : "",
        `图标：${techStack.frontend.icons || "无"}`,
      ].filter(Boolean),

      "add-test": techStack.testing.enabled
        ? [
            `测试框架：${techStack.testing.framework}`,
            `测试位置：__tests__/`,
            `运行测试：pnpm test:run`,
          ]
        : ["未配置测试框架，建议先安装 Vitest"],
    };

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              task,
              recommendations: recommendations[task] || [],
              techStack: getTechStackSummary(techStack),
            },
            null,
            2
          ),
        },
      ],
    };
  }
);

// ============================================
// 基础工具
// ============================================

// 注册 ping 工具
server.tool(
  "ping",
  "Return pong - 测试 MCP 连接是否正常",
  {
    message: z.string().describe("要回显的消息"),
  },
  async ({ message }) => {
    return {
      content: [
        {
          type: "text",
          text: `pong: ${message}`,
        },
      ],
    };
  }
);

// 注册获取当前时间的工具
server.tool(
  "get_current_time",
  "获取当前服务器时间",
  {},
  async () => {
    const now = new Date();
    return {
      content: [
        {
          type: "text",
          text: `当前时间: ${now.toLocaleString("zh-CN", { timeZone: "Asia/Shanghai" })}`,
        },
      ],
    };
  }
);

// ============================================
// HTTP 服务器
// ============================================

// 存储活跃的传输连接
const transports = new Map<string, SSEServerTransport>();

// 创建 HTTP 服务器
const httpServer = http.createServer(async (req, res) => {
  const url = new URL(req.url || "", `http://localhost:${PORT}`);

  // 设置 CORS 头
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(200);
    res.end();
    return;
  }

  // SSE 端点 - 客户端连接
  if (url.pathname === "/sse" && req.method === "GET") {
    const transport = new SSEServerTransport("/messages", res);
    const sessionId = crypto.randomUUID();
    transports.set(sessionId, transport);

    res.on("close", () => {
      transports.delete(sessionId);
    });

    await server.connect(transport);
    return;
  }

  // 消息端点 - 接收客户端消息
  if (url.pathname === "/messages" && req.method === "POST") {
    const sessionId = url.searchParams.get("sessionId");
    const transport = sessionId
      ? transports.get(sessionId)
      : transports.values().next().value;

    if (!transport) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "No active SSE connection" }));
      return;
    }

    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", async () => {
      try {
        await transport.handlePostMessage(req, res, body);
      } catch (error) {
        console.error("Error handling message:", error);
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Internal server error" }));
      }
    });
    return;
  }

  // 技术栈端点 - 直接 HTTP 访问
  if (url.pathname === "/tech-stack" && req.method === "GET") {
    const format = url.searchParams.get("format") || "json";
    const techStack = getTechStack();

    let content: string;
    let contentType = "application/json";

    switch (format) {
      case "text":
        content = formatTechStack(techStack);
        contentType = "text/plain; charset=utf-8";
        break;
      case "summary":
        content = getTechStackSummary(techStack);
        contentType = "text/plain; charset=utf-8";
        break;
      default:
        content = JSON.stringify(techStack, null, 2);
    }

    res.writeHead(200, { "Content-Type": contentType });
    res.end(content);
    return;
  }

  // 健康检查端点
  if (url.pathname === "/health" && req.method === "GET") {
    const techStack = getTechStack();
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        status: "ok",
        server: "mvpfast-mcp",
        port: PORT,
        project: techStack.name,
        version: techStack.version,
        techStackSummary: getTechStackSummary(techStack),
      })
    );
    return;
  }

  // 404
  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "Not found" }));
});

// 启动服务器
httpServer.listen(PORT, () => {
  console.log("");
  console.log("╔════════════════════════════════════════════════════════╗");
  console.log("║           MVPFast MCP Server Started                   ║");
  console.log("╠════════════════════════════════════════════════════════╣");
  console.log(`║  Server:      http://localhost:${PORT}                     ║`);
  console.log(`║  SSE:         http://localhost:${PORT}/sse                 ║`);
  console.log(`║  Health:      http://localhost:${PORT}/health              ║`);
  console.log(`║  Tech Stack:  http://localhost:${PORT}/tech-stack          ║`);
  console.log("╠════════════════════════════════════════════════════════╣");
  console.log("║  Available Tools:                                      ║");
  console.log("║  - get_tech_stack      获取完整技术栈                  ║");
  console.log("║  - get_project_structure  获取项目结构                 ║");
  console.log("║  - get_framework_info  获取框架信息                    ║");
  console.log("║  - check_feature       检查功能是否可用                ║");
  console.log("║  - get_dev_recommendations  获取开发建议               ║");
  console.log("║  - ping                测试连接                        ║");
  console.log("║  - get_current_time    获取时间                        ║");
  console.log("╚════════════════════════════════════════════════════════╝");
  console.log("");
});
