#version 300 es

uniform float u_aspect;

in vec2 a_position;
in vec4 a_color;

out vec4 v_color;

void main() {
  v_color = a_color.rgba;
  float x = a_position.x;
  float y = a_position.y * u_aspect;
  gl_Position = vec4(x, y, 0.0, 1.0);
}