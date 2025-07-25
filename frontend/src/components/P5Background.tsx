import React from "react";
import Sketch from "react-p5";
import p5Types from "p5";

export const P5Background: React.FC = () => {
  let line_num: number;
  let box_num: number;
  let px: number, py: number, pz: number;
  let eyesetx: number, eyesety: number, eyesetz: number;
  let camsetx: number, camsety: number, camsetz: number;
  let targetx: number, targety: number, targetz: number;
  let offsetx: number, offsety: number, offsetz: number;
  let lines: { px: number; py: number; pz: number }[] = [];
  let boxes: BoxObject[] = [];

  class BoxObject {
    alpha: number;
    box_sizex: number;
    box_sizey: number;
    box_sizez: number;
    box_locx: number;
    box_locy: number;
    box_locz: number;
    col: p5Types.Color;
    c2: p5Types.Color;
    p5: p5Types;

    constructor(
      p5: p5Types,
      x: number,
      y: number,
      z: number,
      a: number,
      sx: number,
      sy: number,
      sz: number,
      c: p5Types.Color,
    ) {
      this.p5 = p5;
      this.alpha = a;
      this.box_sizex = sx;
      this.box_sizey = sy;
      this.box_sizez = sz;
      this.box_locx = x;
      this.box_locy = y;
      this.box_locz = z;
      this.col = c;
      this.c2 = p5.color(p5.random(256), p5.random(256), p5.random(256));
    }

    render() {
      const p5 = this.p5;
      this.alpha += 3.2;
      this.col.setAlpha(this.alpha * 1.8);
      p5.fill(this.col);
      this.col.setAlpha(this.alpha * 2);
      p5.stroke(this.col);
      p5.stroke(this.c2);
      p5.strokeWeight(this.alpha / 200);
      p5.push();
      p5.translate(this.box_locx, this.box_locy, this.box_locz);
      p5.box(
        p5.sin(this.box_sizex) * 30,
        p5.cos(this.box_sizey) * 20,
        p5.tan(this.box_sizez) * 60,
      );
      p5.rotateY(p5.sin(this.box_sizex) * 30);
      p5.translate(this.box_locx * 2, this.box_locy * 2, this.box_locz * 2);
      p5.box(
        p5.cos(this.box_sizex) * 10,
        p5.sin(this.box_sizey) * 10,
        p5.atan2(this.box_sizez, 0) * 10,
      );
      p5.rotateY(p5.cos(this.box_sizex) * 10);
      p5.rotateX(p5.mouseX);
      p5.rotateZ(p5.mouseY);
      p5.pop();
    }
  }

  const setup = (p5: p5Types, canvasParentRef: Element) => {
    p5.pixelDensity(p5.displayDensity());
    p5.createCanvas(p5.windowWidth, p5.windowHeight, "webgl").parent(
      canvasParentRef,
    );
    p5.colorMode("rgb", 256);
    p5.background(0);
    line_num = 500;
    box_num = 520;
    eyesetx = p5.width / 2.0;
    eyesety = p5.height / 2.0;
    eyesetz = 0.0;
    camsetx = p5.width / 2.0;
    camsety = p5.height / 2.0;
    camsetz = 0.0;
    offsetx = p5.width / 2.0;
    offsety = p5.height / 2.0;
    offsetz = 0.0;
    p5.translate(offsetx, offsety, offsetz);
    px = 0.0;
    py = 0.0;
    pz = 0.0;
  };

  const draw = (p5: p5Types) => {
    p5.background(0);
    p5.ambientLight(102, 102, 102);
    p5.directionalLight(102, 102, 102, 0, 0, -1);
    pz -= 120.0;
    lines.push({ px, py, pz });

    if (lines.length > line_num) {
      lines = lines.slice(lines.length - (line_num - 1));
    }

    if (lines.length > 180) {
      targetx = (p5.mouseX - offsetx) * 1.6;
      targety = (p5.mouseY - offsety) * 1.6;
      eyesetx += (targetx - eyesetx) * 0.062;
      eyesety += (targety - eyesety) * 0.062;
      eyesetz = lines[lines.length - 60].pz;
      camsetx += (targetx - camsetx) * 0.064;
      camsety += (targety - camsety) * 0.064;
      camsetz = eyesetz - 10.0;
      p5.camera(
        eyesetx,
        eyesety,
        eyesetz,
        camsetx,
        camsety,
        camsetz,
        0.0,
        1.0,
        0.0,
      );

      for (let i = 0; i < lines.length - 1; i++) {
        if (i > 0) {
          p5.stroke(255);
          p5.strokeWeight(1);
        }
      }

      for (let i = 0; i < 3; i++) {
        const c = p5.color(p5.random(256), p5.random(256), p5.random(256));
        boxes.push(
          new BoxObject(
            p5,
            px + p5.random(-600, 600),
            py + p5.random(-600, 600),
            pz,
            0,
            p5.random(10, 100),
            p5.random(10, 100),
            p5.random(10, 100),
            c,
          ),
        );
      }

      for (let i = 0; i < boxes.length; i++) {
        boxes[i].render();
      }

      if (boxes.length > box_num) {
        for (let i = 0; i < 3; i++) {
          boxes = boxes.slice(boxes.length - (box_num - 1));
        }
      }
    }
  };

  const windowResized = (p5: p5Types) => {
    p5.resizeCanvas(p5.windowWidth, p5.windowHeight);
  };

  return <Sketch setup={setup} draw={draw} windowResized={windowResized} />;
};
