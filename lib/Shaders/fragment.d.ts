declare const shaderSource = "#version 300 es\nprecision highp float;\n\nin vec4 v_color;\n\nout vec4 out_FragColor;\n    \n\nvoid main() {\n  out_FragColor = v_color;\n}";
export default shaderSource;
