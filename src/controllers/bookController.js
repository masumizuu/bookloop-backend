const initModels = require('../models');
const { getSequelizeInstance } = require('../config/db');
const { Op } = require('sequelize'); //Bryan's comment: import Op from sequelize


exports.getBooks = async (req, res) => {
    try {
        const sequelize = getSequelizeInstance();
        const models = await initModels(sequelize);
        const { Book } = models;

        const { page = 1, limit = 6, search = "", genre } = req.query;

        const offset = (page - 1) * limit;

        const whereCondition = {
            ...(search ? { title: { [Op.like]: `%${search}%` } } : {}), //Bryan's comment: instead of using sequelize.Op.like, just use Op.like
            ...(genre ? { genre } : {})  // Add this
        };

        const books = await Book.findAndCountAll({
            where: whereCondition,
            limit: parseInt(limit),
            offset: parseInt(offset),
        });

        res.json({
            total: books.count,
            totalPages: Math.ceil(books.count / limit),
            currentPage: parseInt(page),
            books: books.rows
        });
    } catch (error) {
        res.status(500).json({ error: "Failed to retrieve books" });
    }
};

exports.getBookById = async (req, res) => {
    try {
        const sequelize = getSequelizeInstance();
        const models = await initModels(sequelize);
        const { Book } = models;

        const book = await Book.findByPk(req.params.id);
        if (!book) return res.status(404).json({ error: 'Book not found' });
        res.json(book);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve book' });
    }
};

// admin methods //
exports.addBook = async (req, res) => {
    try {
        const sequelize = getSequelizeInstance();
        const models = await initModels(sequelize);
        const { Book } = models;

        const book = await Book.create(req.body);
        res.status(201).json(book);
    } catch (error) {
        res.status(500).json({ error: 'Failed to add book' });
    }
};

exports.updateBook = async (req, res) => {
    try {
        const sequelize = getSequelizeInstance();
        const models = await initModels(sequelize);
        const { Book } = models;

        const book = await Book.findByPk(req.params.id);
        if (!book) return res.status(404).json({ error: 'Book not found' });

        await book.update(req.body);
        res.json({ message: 'Book updated successfully', book });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update book' });
    }
};

exports.deleteBook = async (req, res) => {
    try {
        const sequelize = getSequelizeInstance();
        const models = await initModels(sequelize);
        const { Book } = models;

        const book = await Book.findByPk(req.params.id);
        if (!book) return res.status(404).json({ error: 'Book not found' });

        await book.destroy();
        res.json({ message: 'Book deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete book' });
    }
};

exports.getBookRequests = async (req, res) => {
    try {
        const sequelize = getSequelizeInstance();
        const models = await initModels(sequelize);
        const { Book } = models;

        const requestedBooks = await Book.findAll({ where: { status: 'Requested', owner_id: req.user.user_id } });
        res.json(requestedBooks);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve book requests' });
    }
};

exports.approveBookRequest = async (req, res) => {
    try {
        const sequelize = getSequelizeInstance();
        const models = await initModels(sequelize);
        const { Book, BorrowTransaction } = models;

        const book = await Book.findByPk(req.params.id);
        if (!book || book.status !== 'Requested') {
            return res.status(400).json({ error: 'Book is not requested or does not exist' });
        }

        const borrowTransaction = await BorrowTransaction.findOne({ where: { book_id: book.book_id, status: 'Requested' } });
        if (!borrowTransaction) return res.status(404).json({ error: 'Borrow request not found' });

        await book.update({ status: 'Borrowed', borrowedCount: book.borrowedCount + 1 });
        await borrowTransaction.update({ status: 'Approved' });

        res.json({ message: 'Book request approved, status updated to Borrowed, borrow count incremented' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to approve book request' });
    }
};

exports.denyBookRequest = async (req, res) => {
    try {
        const sequelize = getSequelizeInstance();
        const models = await initModels(sequelize);
        const { Book, BorrowTransaction } = models;

        const book = await Book.findByPk(req.params.id);
        if (!book || book.status !== 'Requested') {
            return res.status(400).json({ error: 'Book is not requested or does not exist' });
        }

        const borrowTransaction = await BorrowTransaction.findOne({ where: { book_id: book.book_id, status: 'Requested' } });
        if (!borrowTransaction) return res.status(404).json({ error: 'Borrow request not found' });

        await book.update({ status: 'Available' });
        await borrowTransaction.update({ status: 'Denied' });

        res.json({ message: 'Book request denied, status reset to Available' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to deny book request' });
    }
};
