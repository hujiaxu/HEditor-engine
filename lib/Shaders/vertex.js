const shaderSource = `#version 300 es

uniform float u_aspect;

uniform mat4 u_projectionMatrix;
uniform mat4 u_viewMatrix;
uniform mat4 u_modelMatrix;

in vec2 a_position;
in vec4 a_color;

out vec4 v_color;

void main() {
  v_color = a_color.rgba;
  float x = a_position.x;
  float y = a_position.y * u_aspect;
  vec4 pos = vec4(x, y, 0.0, 1.0);
  gl_Position = pos;
}`;
export default shaderSource;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmVydGV4LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL1NoYWRlcnMvdmVydGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE1BQU0sWUFBWSxHQUFHOzs7Ozs7Ozs7Ozs7Ozs7Ozs7O0VBbUJuQixDQUFBO0FBQ0YsZUFBZSxZQUFZLENBQUEifQ==