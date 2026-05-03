import { DataTypes, Model } from 'sequelize';
import sequelize from '../db';

class Admin extends Model {
  declare id: number;
  declare username: string;
  declare password: string;
}

Admin.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'Admin',
  }
);

export default Admin;
