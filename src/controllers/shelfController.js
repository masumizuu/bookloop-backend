const initModels = require('../models');
const {getSequelizeInstance} = require("../config/db");

exports.getShelf = async (req, res) => {
    try {
        const sequelize = getSequelizeInstance();
        const models = await initModels(sequelize);
        const { Shelf, Book } = models;

        const shelf = await Shelf.findOne({ where: { user_id: req.params.userId }, include: [Book] });
        if (!shelf) return res.status(404).json({ error: 'Shelf not found' });
        res.json(shelf);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve shelf' });
    }
};
