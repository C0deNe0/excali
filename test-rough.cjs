const rough = require('roughjs');
const rc = rough.generator();
const d = rc.rectangle(10, 10, 100, 100);
const getSvgPathFromRough = (drawable) => {
  const paths = [];
  drawable.sets.forEach((set) => {
    set.ops.forEach((op) => {
      if (op.op === 'move') {
        paths.push(`M${op.data[0]} ${op.data[1]}`);
      } else if (op.op === 'bcurveTo') {
        paths.push(`C${op.data[0]} ${op.data[1]}, ${op.data[2]} ${op.data[3]}, ${op.data[4]} ${op.data[5]}`);
      } else if (op.op === 'lineTo') {
        paths.push(`L${op.data[0]} ${op.data[1]}`);
      }
    });
  });
  return paths.join(' ');
};
console.log(getSvgPathFromRough(d));
