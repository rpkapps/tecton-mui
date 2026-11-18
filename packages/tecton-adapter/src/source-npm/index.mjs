// Future npm source adapter. Once the Tecton npm packages (@webframework/tecton-core and
// @webframework/tecton-mui) are accessible, implement loadNpm() to return the same RawTectonSource
// contract as the UMD adapter (see ../normalized/contract.ts). No runtime code depends on this file,
// so switching `source` in tecton.config.json changes nothing in component imports or theme APIs.
export async function loadNpm({ config }) {
  throw new Error(
    `The npm Tecton source adapter is not implemented yet (${config.npm.corePackage}, ` +
      `${config.npm.muiPackage}). Keep "source": "umd" in tecton.config.json.`,
  );
}
