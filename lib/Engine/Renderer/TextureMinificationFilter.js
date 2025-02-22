const TextureMinificationFilter = {
    NEAREST: WebGL2RenderingContext.NEAREST,
    LINEAR: WebGL2RenderingContext.LINEAR,
    NEAREST_MIPMAP_NEAREST: WebGL2RenderingContext.NEAREST_MIPMAP_NEAREST,
    LINEAR_MIPMAP_NEAREST: WebGL2RenderingContext.LINEAR_MIPMAP_NEAREST,
    NEAREST_MIPMAP_LINEAR: WebGL2RenderingContext.NEAREST_MIPMAP_LINEAR,
    LINEAR_MIPMAP_LINEAR: WebGL2RenderingContext.LINEAR_MIPMAP_LINEAR,
    validate(textureMinificationFilter) {
        return (textureMinificationFilter === TextureMinificationFilter.NEAREST ||
            textureMinificationFilter === TextureMinificationFilter.LINEAR ||
            textureMinificationFilter ===
                TextureMinificationFilter.NEAREST_MIPMAP_NEAREST ||
            textureMinificationFilter ===
                TextureMinificationFilter.LINEAR_MIPMAP_NEAREST ||
            textureMinificationFilter ===
                TextureMinificationFilter.NEAREST_MIPMAP_LINEAR ||
            textureMinificationFilter ===
                TextureMinificationFilter.LINEAR_MIPMAP_LINEAR);
    }
};
export default TextureMinificationFilter;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGV4dHVyZU1pbmlmaWNhdGlvbkZpbHRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9FbmdpbmUvUmVuZGVyZXIvVGV4dHVyZU1pbmlmaWNhdGlvbkZpbHRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxNQUFNLHlCQUF5QixHQUFHO0lBQ2hDLE9BQU8sRUFBRSxzQkFBc0IsQ0FBQyxPQUFPO0lBQ3ZDLE1BQU0sRUFBRSxzQkFBc0IsQ0FBQyxNQUFNO0lBQ3JDLHNCQUFzQixFQUFFLHNCQUFzQixDQUFDLHNCQUFzQjtJQUNyRSxxQkFBcUIsRUFBRSxzQkFBc0IsQ0FBQyxxQkFBcUI7SUFDbkUscUJBQXFCLEVBQUUsc0JBQXNCLENBQUMscUJBQXFCO0lBQ25FLG9CQUFvQixFQUFFLHNCQUFzQixDQUFDLG9CQUFvQjtJQUVqRSxRQUFRLENBQUMseUJBQWlDO1FBQ3hDLE9BQU8sQ0FDTCx5QkFBeUIsS0FBSyx5QkFBeUIsQ0FBQyxPQUFPO1lBQy9ELHlCQUF5QixLQUFLLHlCQUF5QixDQUFDLE1BQU07WUFDOUQseUJBQXlCO2dCQUN2Qix5QkFBeUIsQ0FBQyxzQkFBc0I7WUFDbEQseUJBQXlCO2dCQUN2Qix5QkFBeUIsQ0FBQyxxQkFBcUI7WUFDakQseUJBQXlCO2dCQUN2Qix5QkFBeUIsQ0FBQyxxQkFBcUI7WUFDakQseUJBQXlCO2dCQUN2Qix5QkFBeUIsQ0FBQyxvQkFBb0IsQ0FDakQsQ0FBQTtJQUNILENBQUM7Q0FDRixDQUFBO0FBQ0QsZUFBZSx5QkFBeUIsQ0FBQSJ9