// Initialize communication channel
function initChannel() {
  // Check if running inside an iframe
  window.methodDrawConfig = window.methodDrawConfig || {};
  window.methodDrawConfig.isEmbedded = (window.self !== window.top);
  console.log("Method-Draw running in " + (window.methodDrawConfig.isEmbedded ? "embedded" : "standalone") + " mode");

  // 等待DOM加载完成后更新UI
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updateUIForEmbeddedMode);
  } else {
    // DOM已加载完成，直接执行
    updateUIForEmbeddedMode();
  }

  // Notify parent that drawsvg is ready
  window.parent.postMessage({ type: "onDrawSVGReady" }, "*");
  console.log("onDrawSVGReady");

  // Handle messages from parent
  window.addEventListener("message", function (event) {
    if (!event.data || !event.data.type) return;

    const { type, data, messageId } = event.data;

    switch (type) {
      case "loadStringSVG":
        try {
          svgCanvas.setSvgString(data.svg);
          event.source.postMessage(
            {
              type: "loadStringSVG:response",
              messageId,
              success: true,
            },
            "*"
          );
        } catch (err) {
          console.error("Error loading SVG:", err);
          event.source.postMessage(
            {
              type: "loadStringSVG:response",
              messageId,
              success: false,
              error: err.message,
            },
            "*"
          );
        }
        break;

      case "setFeatureDisabled":
        try {
          // 允许父页面控制功能的禁用状态
          if (data && typeof data.isDisabled === 'boolean') {
            window.methodDrawConfig.isEmbedded = data.isDisabled;
            console.log("Method-Draw features " + (data.isDisabled ? "disabled" : "enabled") + " by parent");
            
            // 更新UI
            updateUIForEmbeddedMode();
          }
          event.source.postMessage(
            {
              type: "setFeatureDisabled:response",
              messageId,
              success: true,
            },
            "*"
          );
        } catch (err) {
          console.error("Error setting feature disabled state:", err);
          event.source.postMessage(
            {
              type: "setFeatureDisabled:response",
              messageId,
              success: false,
              error: err.message,
            },
            "*"
          );
        }
        break;

      case "getSVG":
        try {
          const svgString = svgCanvas.getSvgString();
          event.source.postMessage(
            {
              type: "getSVG:response",
              messageId,
              success: true,
              data: svgString,
            },
            "*"
          );
        } catch (err) {
          console.error("Error getting SVG:", err);
          event.source.postMessage(
            {
              type: "getSVG:response",
              messageId,
              success: false,
              error: err.message,
            },
            "*"
          );
        }
        break;

      case "onSaveSVG":
        try {
          const svgString = svgCanvas.getSvgString();
          event.source.postMessage(
            {
              type: "onSaveSVG:response",
              messageId,
              success: true,
              data: svgString,
            },
            "*"
          );
        } catch (err) {
          console.error("Error saving SVG:", err);
          event.source.postMessage(
            {
              type: "onSaveSVG:response",
              messageId,
              success: false,
              error: err.message,
            },
            "*"
          );
        }
        break;
    }
  });
}

initChannel();

/**
 * 根据嵌入状态更新UI
 * 在嵌入模式下禁用新建文档和打开SVG按钮
 */
function updateUIForEmbeddedMode() {
  if (window.methodDrawConfig && window.methodDrawConfig.isEmbedded) {
    // 为body添加嵌入模式的类
    document.body.classList.add('embedded-mode');
    
    // 禁用新建文档按钮
    const clearButton = document.getElementById('tool_clear');
    if (clearButton) {
      clearButton.classList.add('disabled-in-embed');
      clearButton.setAttribute('title', '在嵌入模式下无法使用新建文档功能');
    }
    
    // 禁用打开SVG按钮
    const openButton = document.getElementById('tool_open');
    if (openButton) {
      openButton.classList.add('disabled-in-embed');
      openButton.setAttribute('title', '在嵌入模式下无法使用打开SVG功能');
    }
  } else {
    // 移除嵌入模式类
    document.body.classList.remove('embedded-mode');
    
    // 启用按钮
    const clearButton = document.getElementById('tool_clear');
    if (clearButton) {
      clearButton.classList.remove('disabled-in-embed');
      clearButton.setAttribute('title', '新建文档 [Ctrl+N]');
    }
    
    const openButton = document.getElementById('tool_open');
    if (openButton) {
      openButton.classList.remove('disabled-in-embed');
      openButton.setAttribute('title', '打开SVG [Ctrl+O]');
    }
  }
}
