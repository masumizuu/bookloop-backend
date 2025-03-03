module.exports = (sequelize, DataTypes) => {
    const Saved = sequelize.define('Saved', {
        saved_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        user_id: { type: DataTypes.INTEGER, allowNull: false }
    }, { tableName: 'saved_books', timestamps: false });

    return Saved;
};