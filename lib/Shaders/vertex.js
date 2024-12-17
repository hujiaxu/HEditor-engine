const shaderSource = `#version 300 es


uniform mat4 u_projectionMatrix;
uniform mat4 u_viewMatrix;
uniform mat4 u_modelMatrix;

in vec3 a_position;
in vec4 a_color;

out vec4 v_color;

void main() {
  v_color = a_color.rgba;
  vec4 pos = vec4(a_position.xyz, 1.0);
  
  gl_Position = u_projectionMatrix * u_viewMatrix * u_modelMatrix * pos;
}`;
export default shaderSource;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmVydGV4LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL1NoYWRlcnMvdmVydGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE1BQU0sWUFBWSxHQUFHOzs7Ozs7Ozs7Ozs7Ozs7OztFQWlCbkIsQ0FBQTtBQUNGLGVBQWUsWUFBWSxDQUFBIn0=