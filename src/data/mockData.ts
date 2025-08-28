import { ProjectData, Interaction } from '../types/analytics';

// Generate mock data based on the provided structure
export const mockProjectData: ProjectData[] = [
  {
    username: "john.doe",
    project_id: "WMPRJ2c9180889675120e01968571d1250159",
    project_name: "pilot_test",
    project_type: "WEB",
    interaction: [
      {
        agentId: "wm_security_agent",
        sessionId: "ae620910-91bf-4a0e-892a-58fec8da54f2",
        requestId: "3c325656-9535-48b6-9c25-266e1fd50808",
        exchangeId: "3c325656-9535-48b6-9c25-266e1fd50808-exchange-1",
        llmRequest: {
          type: "tool_result",
          toolId: "toolu_01AGvDF1yxQU4sGY7SAbcEam",
          content: "{\"projectInfo\":{\"id\":\"WMPRJ2c92808a9883263c019883277e710000\",\"name\":\"TestApp\",\"displayName\":\"TestApp\",\"platformType\":\"WEB\",\"type\":\"APPLICATION\"},\"userDisplayName\":\"user1\"}"
        },
        llmResponse: [
          {
            type: "text",
            content: "Now let me get the current login configuration to show you the session timeout settings:"
          },
          {
            type: "tool_use",
            content: "Tool call: mcp_platform-server_getLoginConfig",
            toolId: "toolu_011Mz6rdEbP5w4uYRN98ExJD",
            toolName: "mcp_platform-server_getLoginConfig",
            toolInputs: {
              projectId: "WMPRJ2c92808a9883263c019883277e710000"
            }
          }
        ],
        timestamp: 1756186859568,
        model: "anthropic/claude-sonnet-4-20250514",
        provider: "anthropic",
        exchangeType: "tool_result",
        tokenUsage: {
          inputTokens: 324234,
          outputTokens: 23423,
          totalTokens: 347657
        }
      },
      {
        agentId: "wm_security_agent",
        sessionId: "ae620910-91bf-4a0e-892a-58fec8da54f2",
        requestId: "4d426767-a646-59c7-a336-377e2ge61919",
        exchangeId: "4d426767-a646-59c7-a336-377e2ge61919-exchange-2",
        llmRequest: {
          type: "user_message",
          content: "Can you help me configure authentication settings?"
        },
        llmResponse: [
          {
            type: "text",
            content: "I'll help you configure the authentication settings for your project. Let me check the current configuration first."
          }
        ],
        timestamp: 1756186920000,
        model: "anthropic/claude-sonnet-4-20250514",
        provider: "anthropic",
        exchangeType: "user_message",
        tokenUsage: {
          inputTokens: 150,
          outputTokens: 89,
          totalTokens: 239
        }
      }
    ]
  },
  {
    username: "sarah.wilson",
    project_id: "WMPRJ3d8291990786231f02079682e2361270",
    project_name: "ecommerce_platform",
    project_type: "MOBILE",
    interaction: [
      {
        agentId: "wm_dev_agent",
        sessionId: "bf731021-a2cg-5b1f-9a3b-69gfd9eb65g3",
        requestId: "5e537878-b757-6ac8-b447-488f3hf72a2a",
        exchangeId: "5e537878-b757-6ac8-b447-488f3hf72a2a-exchange-1",
        llmRequest: {
          type: "user_message",
          content: "Create a shopping cart component with React Native"
        },
        llmResponse: [
          {
            type: "text",
            content: "I'll create a comprehensive shopping cart component for your React Native app with add/remove functionality, quantity controls, and price calculations."
          },
          {
            type: "tool_use",
            content: "Tool call: create_react_native_component",
            toolId: "toolu_022Nz7seGfQ6x5vZSO09FyKE",
            toolName: "create_react_native_component",
            toolInputs: {
              componentName: "ShoppingCart",
              functionality: "cart_management"
            }
          }
        ],
        timestamp: 1756180000000,
        model: "anthropic/claude-sonnet-4-20250514",
        provider: "anthropic",
        exchangeType: "user_message",
        tokenUsage: {
          inputTokens: 892,
          outputTokens: 2156,
          totalTokens: 3048
        }
      }
    ]
  },
  {
    username: "mike.chen",
    project_id: "WMPRJ4f9402a01897342g03190793f3472381",
    project_name: "data_analysis_tool",
    project_type: "DESKTOP",
    interaction: [
      {
        agentId: "wm_data_agent",
        sessionId: "cg842132-b3dh-6c2g-ab4c-7ahge0fc76h4",
        requestId: "6f648989-c868-7bd9-c558-599g4ig83b3b",
        exchangeId: "6f648989-c868-7bd9-c558-599g4ig83b3b-exchange-1",
        llmRequest: {
          type: "user_message",
          content: "Help me build a data visualization dashboard with Python"
        },
        llmResponse: [
          {
            type: "text",
            content: "I'll help you create a comprehensive data visualization dashboard using Python with Plotly and Streamlit for interactive charts and real-time updates."
          }
        ],
        timestamp: 1756170000000,
        model: "anthropic/claude-sonnet-4-20250514",
        provider: "anthropic",
        exchangeType: "user_message",
        tokenUsage: {
          inputTokens: 445,
          outputTokens: 1223,
          totalTokens: 1668
        }
      },
      {
        agentId: "wm_data_agent",
        sessionId: "cg842132-b3dh-6c2g-ab4c-7ahge0fc76h4",
        requestId: "7g759a9a-d979-8ce0-d669-6aah5jh94c4c",
        exchangeId: "7g759a9a-d979-8ce0-d669-6aah5jh94c4c-exchange-2",
        llmRequest: {
          type: "user_message",
          content: "Add real-time data streaming capabilities"
        },
        llmResponse: [
          {
            type: "text",
            content: "I'll add WebSocket support for real-time data streaming to your dashboard. This will enable live updates without page refreshes."
          },
          {
            type: "tool_use",
            content: "Tool call: implement_websocket_streaming",
            toolId: "toolu_033Oz8tfHgR7y6wATQ10GzLF",
            toolName: "implement_websocket_streaming",
            toolInputs: {
              protocol: "websocket",
              framework: "streamlit"
            }
          }
        ],
        timestamp: 1756170300000,
        model: "anthropic/claude-sonnet-4-20250514",
        provider: "anthropic",
        exchangeType: "user_message",
        tokenUsage: {
          inputTokens: 678,
          outputTokens: 1445,
          totalTokens: 2123
        }
      }
    ]
  },
  {
    username: "emily.rodriguez",
    project_id: "WMPRJ5g0513b12908453h04201804g4583492",
    project_name: "ai_content_generator",
    project_type: "WEB",
    interaction: [
      {
        agentId: "wm_content_agent",
        sessionId: "dh953243-c4ei-7d3h-bc5d-8bihf1gd87i5",
        requestId: "8h860b0b-e080-9df1-e770-7bbj6kj05d5d",
        exchangeId: "8h860b0b-e080-9df1-e770-7bbj6kj05d5d-exchange-1",
        llmRequest: {
          type: "user_message",
          content: "Generate blog post content about machine learning trends"
        },
        llmResponse: [
          {
            type: "text",
            content: "I'll create comprehensive blog post content covering the latest machine learning trends, including AI democratization, edge computing, and ethical AI development."
          }
        ],
        timestamp: 1756100000000,
        model: "anthropic/claude-sonnet-4-20250514",
        provider: "anthropic",
        exchangeType: "user_message",
        tokenUsage: {
          inputTokens: 234,
          outputTokens: 1567,
          totalTokens: 1801
        }
      }
    ]
  },
  {
    username: "alex.turner",
    project_id: "WMPRJ6h1624c23019564i05312915h5694503",
    project_name: "mobile_game_engine",
    project_type: "MOBILE",
    interaction: [
      {
        agentId: "wm_game_agent",
        sessionId: "ei064354-d5fj-8e4i-cd6e-9cijg2he98j6",
        requestId: "9i971c1c-f191-0eg2-f881-8cck7lk16e6e",
        exchangeId: "9i971c1c-f191-0eg2-f881-8cck7lk16e6e-exchange-1",
        llmRequest: {
          type: "user_message",
          content: "Implement physics engine for 2D platformer game"
        },
        llmResponse: [
          {
            type: "text",
            content: "I'll implement a robust 2D physics engine with collision detection, gravity, and platform mechanics suitable for mobile gaming."
          },
          {
            type: "tool_use",
            content: "Tool call: create_physics_engine",
            toolId: "toolu_044Pz9ugIhS8z7xBUR21HzMG",
            toolName: "create_physics_engine",
            toolInputs: {
              engineType: "2d_physics",
              platform: "mobile"
            }
          }
        ],
        timestamp: 1756050000000,
        model: "anthropic/claude-sonnet-4-20250514",
        provider: "anthropic",
        exchangeType: "user_message",
        tokenUsage: {
          inputTokens: 567,
          outputTokens: 2234,
          totalTokens: 2801
        }
      },
      {
        agentId: "wm_game_agent",
        sessionId: "ei064354-d5fj-8e4i-cd6e-9cijg2he98j6",
        requestId: "aj082d2d-g202-1fh3-g992-9ddl8ml27f7f",
        exchangeId: "aj082d2d-g202-1fh3-g992-9ddl8ml27f7f-exchange-2",
        llmRequest: {
          type: "user_message",
          content: "Add particle effects for explosions and power-ups"
        },
        llmResponse: [
          {
            type: "text",
            content: "I'll add a sophisticated particle system with explosion effects, power-up animations, and visual feedback systems."
          }
        ],
        timestamp: 1756051200000,
        model: "anthropic/claude-sonnet-4-20250514",
        provider: "anthropic",
        exchangeType: "user_message",
        tokenUsage: {
          inputTokens: 445,
          outputTokens: 1876,
          totalTokens: 2321
        }
      }
    ]
  }
];