declare const shaderSource = "#version 300 es\n\n\nuniform mat4 u_projectionMatrix;\nuniform mat4 u_viewMatrix;\nuniform mat4 u_modelMatrix;\n\nin vec3 a_position;\nin vec4 a_color;\n\nout vec4 v_color;\n\nvoid main() {\n  v_color = a_color.rgba;\n  vec4 pos = vec4(a_position.xyz, 1.0);\n  \n  gl_Position = u_projectionMatrix * u_viewMatrix * u_modelMatrix * pos;\n}";
export default shaderSource;
