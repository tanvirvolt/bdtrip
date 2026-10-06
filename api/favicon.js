const PNG = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAABKElEQVR42u3bMa7CMBCE4UiU3AiJc7/jBVFQIHgoiJ2dsf0XLrGYz1YI9u52vl62orE3j5LvPUpYGcoMoX/CmDX8YYRZgx+GWCH8R4RVwv+LsFL4twgALBb+BcEefv87WRFaAe5hj46pAL4J3gjxBBAZvgNBClARXoygA6gML0TQACjCixDqAZThBQjbUKuv2AXW1a/67HAA6jmiATrnASANwDVXC0D1qnXtAnYAzwAAeA/gTZD/AgAsex6wD3EcpjwWiz8QVR+MAgBA0G2Q45YIgLQ7we47QgAAaKwDSAsPQCdAYIEEAA+AOITOOiEAADCUyIWEB8BaKJkQHgAAzMXS7vD2cnnXT19Uv4Bz9SNaZpyrH9E01QhA2xyNk7TO0jxdBjBN+/wNaTcJedMHVesAAAAASUVORK5CYII=","base64");
module.exports = (req,res) => {
  res.setHeader("Content-Type","image/png");
  res.setHeader("Cache-Control","public, max-age=31536000, immutable");
  res.status(200).send(PNG);
};
