const ipfsClient = require('ipfs-http-client');
const QRCode = require('qrcode-generator');
const fs = require('fs');

const ipfs = ipfsClient({ host: 'localhost', port: '5001', protocol: 'http' });

async function addToIPFS() {
    // Contenido del archivo a agregar
    const fileContent = Buffer.from('Hello, IPFS!');
  
    try {
      // Agregar el contenido del archivo a IPFS
      const result = await ipfs.add({ content: fileContent });
  
      // Obtener el hash de IPFS del resultado
      const ipfsHash = result[0].hash;
  
      // Imprimir el hash de IPFS en la consola
      console.log('IPFS hash:', ipfsHash);
  
      // Generar un código QR para el hash de IPFS y guardarlo como 'ipfsHashQR.png'
      QRCode.toFile('ipfsHashQR.png', ipfsHash, function (err) {
        if (err) throw err;
        console.log('Código QR generado para el hash de IPFS.');
      });
    } catch (error) {
      // Manejar errores si hay algún problema con la operación de IPFS
      console.error(error);
    }
  }
  addToIPFS();
  


//npm install qrcode-generator
