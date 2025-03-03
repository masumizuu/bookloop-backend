const initModels = require('../models');
const {getSequelizeInstance} = require("../config/db");

exports.getSavedList = async (req, res) => {
    try {
        const sequelize = getSequelizeInstance();
        const models = await initModels(sequelize);
        const { Saved, Book } = models;

        const savedList = await Saved.findOne({ where: { user_id: req.params.userId }, include: [Book] });
        if (!savedList) return res.status(404).json({ error: 'Saved list not found' });
        res.json(savedList);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve saved list' });
    }
};

exports.saveBook = async (req, res) => {
    try {
        const sequelize = getSequelizeInstance();
        const models = await initModels(sequelize);
        const { Saved, Book } = models;

        const { user_id, book_id } = req.body;

        const book = await Book.findByPk(book_id);
        if (!book) return res.status(404).json({ error: 'Book not found' });

        let savedList = await Saved.findOne({ where: { user_id } });
        if (!savedList) {
            savedList = await Saved.create({ user_id });
        }

        await savedList.addBook(book);
        res.json({ message: 'Book added to saved list' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to save book' });
    }
};

exports.removeBookFromSaved = async (req, res) => {
    try {
        const sequelize = getSequelizeInstance();
        const models = await initModels(sequelize);
        const { Saved, Book } = models;

        const { user_id, book_id } = req.body;

        const book = await Book.findByPk(book_id);
        if (!book) return res.status(404).json({ error: 'Book not found' });

        const savedList = await Saved.findOne({ where: { user_id } });
        if (!savedList) return res.status(404).json({ error: 'Saved list not found' });

        await savedList.removeBook(book);
        res.json({ message: 'Book removed from saved list' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to remove book from saved list' });
    }
};
