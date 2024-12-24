const shaderSource = `#version 300 es


uniform mat4 u_projectionMatrix;
uniform mat4 u_viewMatrix;
uniform mat4 u_modelMatrix;

in vec3 a_position;
in vec4 a_color;

out vec4 v_color;

void main() {
  v_color = a_color.rgba;
  float x = a_position.x;
  float y = a_position.y;
  float z = a_position.z;
  vec4 pos = vec4(x, y, z, 1.0);
  mat4 viewMatrix = mat4(
    -0.5, 0.0, 0.0, 0.0,
    0.0, -0.5, 0.0, 0.0,
    0.0, 0.0, -0.5, 0.0,
    0.5, 0.5, 0.0, 1.0
  );
  gl_Position = u_projectionMatrix * u_viewMatrix * pos;
}`
export default shaderSource
