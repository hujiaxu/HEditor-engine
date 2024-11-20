declare const shaderSource = "#version 300 es\n\nin vec2 a_position;\nin vec4 a_color;\n\nout vec4 v_color;\n\nvoid main() {\n  v_color = a_color.rgba;\n  gl_Position = vec4(a_position.xy, 1.0, 1.0);\n}";
export default shaderSource;
