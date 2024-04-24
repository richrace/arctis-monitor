const pinned = ['eslint'];
const ignored = [];
const skipped = [];

module.exports = {
  target: (pkg) => {
    if (pinned.some((pin) => pin === pkg)) {
      const res = 'minor';
      console.log(` ${pkg} is pinned to ${res} upgrades only (.ncurc.js)`);
      return res;
    }
    return 'latest';
  },

  filterResults: (pkg, { upgradedVersion }) => {
    if (ignored.some((ignore) => ignore.pkg === pkg)) {
      return false;
    }
    if (skipped.some((skip) => skip.pkg === pkg && skip.version === upgradedVersion)) {
      return false;
    }
    return true;
  },
};
