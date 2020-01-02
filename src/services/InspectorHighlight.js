import { overlay } from "./InspectorGui";

function getComputedPoints(node, scale) {
  const bounds = node.getBounds();
  const position = node.getGlobalPosition();

  return {
    original: bounds,

    x: bounds.x / scale.x,
    y: bounds.y / scale.y,
    width: bounds.width / scale.x,
    height: bounds.height / scale.y,

    root: {
      x: position.x / scale.x,
      y: position.y / scale.y
    }
  };
}

export default class InspectorHighlight {
  constructor(inspector) {
    this.gui = inspector.gui;
    this.graphics = new overlay.PIXI.Graphics();
    inspector.gui.container.addChild(this.graphics);
    // if (this.graphics.transform && this.graphics.transform.worldTransform) {
    //   this.defaultTransform = this.graphics.transform.worldTransform.clone()
    // }
    inspector.registerHook("afterRender", this.update.bind(this));
  }

  update(_, renderer) {
    const out = this.graphics;
    const node = InspectorHighlight.node;

    if (node && node.parent) {
      out.visible = true;
      out.clear();
      // } else {
      // if (this.defaultTransform) {
      //   out.transform.setFromMatrix(this.defaultTransform)
      // }
      // out.lineStyle(1, 0xffaa40, 1)
      // out.beginFill(0x007eff, 0.05)

      const scale = {
        x: this.gui.resolution.x / renderer.resolution,
        y: this.gui.resolution.y / renderer.resolution
      };

      const computed = getComputedPoints(node, scale);

      // Render the root point
      out.lineStyle(1, 0xffaa40, 1);
      out.beginFill(0xff8500, 0.235);
      out.drawCircle(
        computed.root.x,
        computed.root.y,
        32 / Math.max(scale.x, scale.y)
      );

      // Render the texture size
      out.beginFill(0x007eff, 0.3);
      out.lineStyle(1, 0x007eff, 0.6);
      out.drawRect(computed.x, computed.y, computed.width, computed.height);

      const parent = getComputedPoints(node.parent, scale);
      const offDisplay =
        computed.x + computed.width < 0 ||
        computed.y + computed.height < 0 ||
        computed.x > renderer.width ||
        computed.y > renderer.height;

      out.lineStyle(2, offDisplay ? 0xff0000 : 0x00ff00, 0.3);
      out.moveTo(parent.root.x, parent.root.y);
      out.lineTo(computed.root.x, computed.root.y);
      out.endFill();
    } else {
      out.visible = false;
    }
  }
}

InspectorHighlight.node = false;
