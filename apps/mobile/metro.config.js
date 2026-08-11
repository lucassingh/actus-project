const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, "../..");

module.exports = (() => {
    const config = getDefaultConfig(projectRoot);

    const { transformer, resolver } = config;

    // Monorepo support: watch shared packages and resolve hoisted deps from the workspace root.
    config.watchFolders = [monorepoRoot];
    config.resolver = {
        ...resolver,
        nodeModulesPaths: [
            path.resolve(projectRoot, "node_modules"),
            path.resolve(monorepoRoot, "node_modules"),
        ],
        disableHierarchicalLookup: true,
        assetExts: resolver.assetExts.filter((ext) => ext !== "svg"),
        sourceExts: [...resolver.sourceExts, "svg"],
    };

    config.transformer = {
        ...transformer,
        babelTransformerPath: require.resolve("react-native-svg-transformer"),
    };

    return config;
})();
