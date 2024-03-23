const express = require('express');
const router = express.Router();
const Inventory = require('./models/Inventory');
const AWS = require('aws-sdk');
const fs = require('fs');

const multer = require('multer');
const upload = multer(); 


const s3 = new AWS.S3({
  accessKeyId: 'AKIAU6GDZRRARI4VNZ2V',
  secretAccessKey: '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'
});

const uploadFileToS3 = (fileContent, fileName, bucketName) => {
  return new Promise((resolve, reject) => {
    const params = {
      Bucket: bucketName,
      Key: fileName,
      Body: fileContent,
    };

    s3.upload(params, (err, data) => {
      if (err) {
        console.error('Error uploading file to S3:', err);
        reject(err);
      } else {
        console.log('File uploaded successfully to S3:', data.Location);
        resolve(data.Location);
      }
    });
  });
};

router.post('/',  upload.single('image'), async (req, res) => {
  
  const { name, quantity} = req.body;
  const file = req.file.buffer;
  const filename = req.file.originalname;


  try {
   const imageUrl = await uploadFileToS3(file, filename, 'inventory-sree');

    const inventoryItem = new Inventory({
      name,
      quantity,
      imageUrl,
    });

    const newInventoryItem = await inventoryItem.save();
    res.status(201).json(newInventoryItem);
  } catch (error) {
    console.error('Error creating inventory item:', error);
    res.status(400).json({ message: 'Failed to create inventory item', error: error.message });
  }
});



router.get('/', async (req, res) => {
  try {
    const inventoryItems = await Inventory.find();
    res.json(inventoryItems);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


router.put('/:id', async (req, res) => {
  try {
    const inventoryItem = await Inventory.findById(req.params.id);
    if (!inventoryItem) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }

    inventoryItem.name = req.body.name;
    inventoryItem.quantity = req.body.quantity;

    const updatedInventoryItem = await inventoryItem.save();
    res.json(updatedInventoryItem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});


router.delete('/:id', async (req, res) => {
  try {
    const deletedInventoryItem = await Inventory.findOneAndDelete({ _id: req.params.id });
    if (!deletedInventoryItem) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }
    res.json({ message: 'Inventory item deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


module.exports = router;
