const shaderSource = `#version 300 es

in vec2 a_position;
in vec4 a_color;

out vec4 v_color;

void main() {
  v_color = a_color.rgba;
  gl_Position = vec4(a_position.xy, 1.0, 1.0);
}`;
export default shaderSource;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmVydGV4LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL1NoYWRlcnMvdmVydGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE1BQU0sWUFBWSxHQUFHOzs7Ozs7Ozs7O0VBVW5CLENBQUE7QUFDRixlQUFlLFlBQVksQ0FBQSJ9