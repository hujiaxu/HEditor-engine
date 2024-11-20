#version 300 es

in vec2 a_position;
in vec4 a_color;

out vec4 v_color;

void main() {
  v_color = a_color.rgba;
  gl_Position = vec4(a_position.xy, 1.0, 1.0);
}