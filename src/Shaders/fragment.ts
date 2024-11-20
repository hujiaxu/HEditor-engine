const shaderSource = `#version 300 es
precision highp float;

in vec4 v_color;

out vec4 out_FragColor;
    

void main() {
  out_FragColor = v_color;
}`
export default shaderSource
