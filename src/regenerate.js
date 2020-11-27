const fs = require("fs").promises;
const path = require("path");
const networks = require("@bondappetit/networks");

(async (tokenlistPath) => {
  const networksMap = new Map(
    Object.entries(networks).reduce(
      (result, [networkName, { networkId, assets }]) => {
        if (networkName.indexOf("-fork") !== -1) return result;

        return [
          ...result,
          [
            networkId,
            new Map(
              Object.values(assets).map((asset) => [asset.symbol, asset])
            ),
          ],
        ];
      },
      []
    )
  );

  const tokenlist = JSON.parse(await fs.readFile(tokenlistPath));
  const regeneratedTokenlist = {
    ...tokenlist,
    tokens: tokenlist.tokens.map((token) => {
      const network = networksMap.get(token.chainId);
      if (network === undefined) return token;

      const asset = network.get(token.symbol);
      if (asset === undefined) return token;

      console.log(`Update ${token.symbol} token for ${token.chainId} network`);
      return {
        ...token,
        address: asset.address,
        name: asset.name,
        decimals: asset.decimals,
      };
    }),
  };

  await fs.writeFile(tokenlistPath, JSON.stringify(regeneratedTokenlist, null, 4));
})(path.resolve(__dirname, "../bondappetit.tokenlist.json"));
