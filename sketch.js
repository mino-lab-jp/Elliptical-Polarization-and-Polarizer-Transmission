
let phaseSlider, ratioSlider;
let playButton, resetButton;

let running = false;
let tm = 0;

const W = 1780;
const H = 950;

// a、bの方向は固定
const AXIS_A = -Math.PI / 4;
const AXIS_B = Math.PI / 4;

const C = {
  cyan: [0, 175, 235],
  plate: [90, 145, 200],
  red: [245, 35, 30],
  green: [0, 175, 95],
  yellow: [255, 255, 175]
};

function setup() {
  createCanvas(W, H);
  pixelDensity(1);
  textFont("Arial");

  // 下部にスライダーを配置
  phaseSlider = createSlider(0, 200, 50, 1);
  phaseSlider.position(575, 775);
  phaseSlider.size(430);

  ratioSlider = createSlider(0, 200, 100, 1);
  ratioSlider.position(1140, 775);
  ratioSlider.size(430);

  // 開始・停止、初期状態ボタン
  playButton = createButton("開始");
  playButton.position(595, 645);
  playButton.size(145, 45);

  playButton.mousePressed(() => {
    running = !running;
    playButton.html(running ? "停止" : "開始");
  });

  resetButton = createButton("初期状態");
  resetButton.position(765, 645);
  resetButton.size(145, 45);

  resetButton.mousePressed(() => {
    running = false;
    tm = 0;
    playButton.html("開始");
    phaseSlider.value(50);
    ratioSlider.value(100);
  });
}

function draw() {
  background(255);

  if (running) {
    tm += 0.035;
  }

  const delta =
    phaseSlider.value() / 100 * Math.PI;

  const A = 1;
  const B = ratioSlider.value() / 100;

  const totalIntensity = A*A + B*B;

  const ampA = projectionAmplitude(
    A, B, delta, AXIS_A
  );

  const ampB = projectionAmplitude(
    A, B, delta, AXIS_B
  );

  const I1 = totalIntensity > 0
    ? ampA*ampA / totalIntensity : 0;

  const I2 = totalIntensity > 0
    ? ampB*ampB / totalIntensity : 0;

  const radiusA = ellipseRadius(
    A, B, delta, AXIS_A
  );

  const radiusB = ellipseRadius(
    A, B, delta, AXIS_B
  );

  // 左側：立体偏光波
  drawIncidentPolarization(
    35, 55, 355, 350,
    delta, A, B
  );

  // 中央上部：偏光状態
  drawPolarizationEllipse(
    720, 155,
    delta, A, B,
    radiusA, radiusB
  );

  // 右側：上下の偏光板
  drawPolarizer(
    1080, 145,
    AXIS_A, C.red, "a 方向"
  );

  drawPolarizer(
    1080, 545,
    AXIS_B, C.green, "b 方向"
  );

  // 矢印
  drawArrow(1320, 160);
  drawArrow(1320, 560);

  // 透過波形
  drawOutputWave(
    1450, 160,
    delta, AXIS_A,
    A, B, C.cyan
  );

  drawOutputWave(
    1450, 560,
    delta, AXIS_B,
    A, B, C.cyan
  );

  // 透過強度
  drawIntensity(1420, 330, I1, I2);

  // 左下の説明枠
  drawExplanation();

  // 下部の操作表示
  drawControls(delta, B, ampA, ampB);
}

// --------------------------------
// 固定方向への射影振幅
// --------------------------------
function projectionAmplitude(A, B, delta, theta) {
  let c = Math.cos(theta);
  let s = Math.sin(theta);

  let value =
    A*A*c*c +
    B*B*s*s +
    2*A*B*c*s*Math.cos(delta);

  return Math.sqrt(Math.max(0, value));
}

// --------------------------------
// 固定方向と楕円輪郭の交点
// --------------------------------
function ellipseRadius(A, B, delta, theta) {
  let c = Math.cos(theta);
  let s = Math.sin(theta);

  let determinant =
    A*A*B*B*
    Math.sin(delta)*Math.sin(delta);

  if (determinant < 1e-9) {
    let vx = A;
    let vy = B*Math.cos(delta);

    let crossValue = vx*s - vy*c;

    if (Math.abs(crossValue) < 1e-5) {
      return Math.sqrt(vx*vx + vy*vy);
    }
    return 0;
  }

  let denominator =
    B*B*c*c +
    A*A*s*s -
    2*A*B*Math.cos(delta)*c*s;

  return Math.sqrt(
    Math.max(0, determinant / denominator)
  );
}

// --------------------------------
// 左側の立体偏光波
// --------------------------------
function drawIncidentPolarization(
  x0, y0, x1, y1, delta, A, B
) {
  const turns = 3.4;
  const frames = 13;

  // 直方体の配置
  const startX = 115;
  const startY = 115;
  const endX = 400;
  const endY = 345;

  const halfSize = 85;

  // 内部の灰色の正方形
  for (let j = 0; j < frames; j++) {
    let u = j / (frames - 1);

    let cx = lerp(startX, endX, u);
    let cy = lerp(startY, endY, u);

    noFill();
    stroke(155, 165, 175);
    strokeWeight(1.2);

    rect(
      cx-halfSize,
      cy-halfSize,
      halfSize*2,
      halfSize*2
    );
  }

  // 黒い太線：直方体の外形
  noFill();
  stroke(0);
  strokeWeight(4);

  // 奥側の正方形
  rect(
    startX-halfSize,
    startY-halfSize,
    halfSize*2,
    halfSize*2
  );

  // 手前側の正方形
  rect(
    endX-halfSize,
    endY-halfSize,
    halfSize*2,
    halfSize*2
  );

  // 奥と手前を結ぶ4本の輪郭線
  line(
    startX-halfSize, startY-halfSize,
    endX-halfSize, endY-halfSize
  );

  line(
    startX+halfSize, startY-halfSize,
    endX+halfSize, endY-halfSize
  );

  line(
    startX-halfSize, startY+halfSize,
    endX-halfSize, endY+halfSize
  );

  line(
    startX+halfSize, startY+halfSize,
    endX+halfSize, endY+halfSize
  );

  // --------------------------------
  // 水色の立体偏光波
  // --------------------------------
  noFill();
  stroke(...C.cyan);
  strokeWeight(5);

  beginShape();

  for (let i = 0; i <= 900; i++) {
    let u = i / 900;

    let t =
      TWO_PI*turns*u - tm + Math.PI;

    let ex = A*Math.cos(t);
    let ey = B*Math.cos(t+delta);

    let cx = lerp(startX, endX, u);
    let cy = lerp(startY, endY, u);

    // 調整済みの立体投影
    let x = cx + 60*ex + 15*ey;
    let y = cy - 20*ex - 55*ey;

    vertex(x, y);
  }

  endShape();

  // --------------------------------
  // 左上の黒い輪郭線を最前面に表示
  // --------------------------------
  noFill();
  stroke(0);
  strokeWeight(4);

  line(
    startX - halfSize,
    startY - halfSize,
    endX - halfSize,
    endY - halfSize
  );

  // --------------------------------
  // 手前側の正方形も最前面に表示
  // --------------------------------
  rect(
    endX - halfSize,
    endY - halfSize,
    halfSize * 2,
    halfSize * 2
  );
}

// --------------------------------
// 中央の偏光楕円
// --------------------------------
function drawPolarizationEllipse(
  cx, cy, delta, A, B, radiusA, radiusB
) {
  const R = 100;

  noFill();
  stroke(...C.plate);
  strokeWeight(5);

  beginShape();

  for (let i = 0; i <= 300; i++) {
    let t = TWO_PI*i/300;

    vertex(
      cx + R*A*Math.cos(t),
      cy - R*B*Math.cos(t+delta)
    );
  }

  endShape();

  // a方向
  let ax = R*radiusA*Math.cos(AXIS_A);
  let ay = -R*radiusA*Math.sin(AXIS_A);

  drawVector(cx, cy, ax, ay, C.red);
  drawVector(cx, cy, -ax, -ay, C.red);

  // b方向
  let bx = R*radiusB*Math.cos(AXIS_B);
  let by = -R*radiusB*Math.sin(AXIS_B);

  drawVector(cx, cy, bx, by, C.green);
  drawVector(cx, cy, -bx, -by, C.green);

  noStroke();
  textStyle(ITALIC);
  textSize(34);

  fill(...C.red);
  text("a", cx+ax+12, cy+ay-10);

  fill(...C.green);
  text("b", cx+bx+12, cy+by+15);

  textStyle(NORMAL);
}

// --------------------------------
// 矢印付きベクトル
// --------------------------------
function drawVector(x, y, dx, dy, col) {
  stroke(...col);
  strokeWeight(5);

  line(x, y, x+dx, y+dy);

  let vectorLength = Math.sqrt(dx*dx+dy*dy);

  if (vectorLength < 4) return;

  let ang = Math.atan2(dy, dx);

  push();
  translate(x+dx, y+dy);
  rotate(ang);

  noStroke();
  fill(...col);

  triangle(0,0,-15,-7,-15,7);
  pop();
}

// --------------------------------
// 固定された偏光板
// --------------------------------
function drawPolarizer(
  cx, cy, theta, axisColor, label
) {
  push();
  translate(cx, cy);

  let w = 210;
  let h = 205;

  let pts = [
    createVector(-w/2, 0),
    createVector(0, -h/2),
    createVector(w/2, 0),
    createVector(0, h/2)
  ];

  fill(220, 235, 250, 110);
  stroke(...C.plate);
  strokeWeight(3);

  beginShape();
  for (let p of pts) {
    vertex(p.x, p.y);
  }
  endShape(CLOSE);

  // 格子線
  let dx = Math.cos(theta);
  let dy = -Math.sin(theta);

  let nx = -dy;
  let ny = dx;

  stroke(...C.plate);
  strokeWeight(2.5);

  for (let offset=-145; offset<=145; offset+=18) {
    let intersections = [];

    for (let j=0; j<4; j++) {
      let p1 = pts[j];
      let p2 = pts[(j+1)%4];

      let d1 = p1.x*nx + p1.y*ny - offset;
      let d2 = p2.x*nx + p2.y*ny - offset;

      if (d1*d2<=0 && Math.abs(d1-d2)>0.00001) {
        let t = d1/(d1-d2);

        intersections.push(
          createVector(
            lerp(p1.x,p2.x,t),
            lerp(p1.y,p2.y,t)
          )
        );
      }
    }

    if (intersections.length>=2) {
      line(
        intersections[0].x,
        intersections[0].y,
        intersections[1].x,
        intersections[1].y
      );
    }
  }

  // 透過軸
  let L = 65;

  stroke(...axisColor);
  strokeWeight(5);

  line(
    -L*dx, -L*dy,
    L*dx, L*dy
  );

  pop();

  noStroke();
  fill(...axisColor);
  textAlign(CENTER);
  textSize(18);
  text(label, cx, cy+125);
}

// --------------------------------
// 右向き矢印
// --------------------------------
function drawArrow(x, y) {
  fill(...C.plate);
  stroke(60,110,160);
  strokeWeight(2);

  beginShape();
  vertex(x-35,y-15);
  vertex(x+5,y-15);
  vertex(x+5,y-32);
  vertex(x+45,y);
  vertex(x+5,y+32);
  vertex(x+5,y+15);
  vertex(x-35,y+15);
  endShape(CLOSE);
}

// --------------------------------
// 透過後の波形
// --------------------------------
function drawOutputWave(
  x0, y0, delta, theta, A, B, col
) {
  const len = 220;
  const c = Math.cos(theta);
  const s = Math.sin(theta);

  noFill();
  stroke(...col);
  strokeWeight(4);

  beginShape();

  for (let i=0; i<=400; i++) {
    let u = i/400;

    let ph = TWO_PI*2*u - tm;

    let ex = A*Math.cos(ph);
    let ey = B*Math.cos(ph+delta);

    // 偏光板の透過軸への射影
    let projected = ex*c + ey*s;

    let tx = projected*c;
    let ty = projected*s;

    let x = x0 + u*len + tx*35;
    let y = y0 + u*35 - ty*65;

    vertex(x,y);
  }

  endShape();
}

// --------------------------------
// 透過強度
// --------------------------------
function drawIntensity(x, y, I1, I2) {
  noStroke();
  textAlign(LEFT);
  textSize(20);

  fill(...C.red);
  text(
    "a方向  I₁ = "+nf(I1,1,3),
    x, y
  );

  fill(...C.green);
  text(
    "b方向  I₂ = "+nf(I2,1,3),
    x, y+35
  );

  fill(40,120,80);
  text(
    "I₁ + I₂ = "+nf(I1+I2,1,3),
    x, y+75
  );
}

// --------------------------------
// 黄色の説明枠
// --------------------------------
function drawExplanation() {
  noStroke();
  fill(...C.yellow);
  rect(35,575,580,195);

  fill(245,0,0);
  textAlign(LEFT);
  textSize(34);
  textStyle(BOLD);

  text("直交ニコル配置と",55,620);
  text("平行ニコル配置の",55,665);
  text("光透過強度の和は1",55,710);

  textSize(27);
  text("（入射光強度と一致）",55,750);

  textStyle(NORMAL);
}

// --------------------------------
// 操作部
// --------------------------------
function drawControls(delta, B, ampA, ampB) {
  noStroke();
  fill(30);
  textAlign(LEFT);
  textSize(18);

  text(
    "位相差 δ = "+
    nf(delta/Math.PI,1,2)+"π",
    575,745
  );

  text(
    "振幅比 B/A = "+
    nf(B,1,2),
    1140,745
  );

  textSize(15);

  fill(...C.red);
  text(
    "a方向の射影振幅 = "+
    nf(ampA,1,3),
    575,815
  );

  fill(...C.green);
  text(
    "b方向の射影振幅 = "+
    nf(ampB,1,3),
    970,815
  );
}
