
class IsoTitle {
  run(src, /*XMLDocument*/target) {
    return target.ele('title', src.title);
  }
}

module.exports = new IsoTitle();
