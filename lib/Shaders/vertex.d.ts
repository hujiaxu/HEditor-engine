declare const shaderSource = "#version 300 es\n\nuniform float u_aspect;\n\nin vec2 a_position;\nin vec4 a_color;\n\nout vec4 v_color;\n\nvoid main() {\n  v_color = a_color.rgba;\n  float x = a_position.x;\n  float y = a_position.y * u_aspect;\n  gl_Position = vec4(x, y, 0.0, 1.0);\n}";
export default shaderSource;
