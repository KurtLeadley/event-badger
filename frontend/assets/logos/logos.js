import RNFS from 'react-native-fs';
import { Image } from 'react-native';

const logos = {
  'adg-tag-rgb.png': require('./adg-tag-rgb.png'),
  'defaultLogo.png': require('./adg-tag-rgb.png'),
  'ncbj.png': require('./ncbj.png'),
};

export const getLogoBase64 = async (logoName) => {
  try {
    const logo = logos[logoName] || logos['defaultLogo.png'];

    // Resolve the path to the image asset
    const imagePath = Image.resolveAssetSource(logo).uri;

    console.log(`Reading asset: ${logoName} from path: ${imagePath}`);

    // Read the file as base64
    const fileBase64 = await RNFS.readFile(imagePath.replace('file://', ''), 'base64');
    console.log(`Successfully read file as base64: ${logoName}`);
    return `data:image/png;base64,${fileBase64}`;
  } catch (error) {
    console.error(`Error in getLogoBase64 for ${logoName}:`, error);
    throw error;
  }
};

export default logos;

