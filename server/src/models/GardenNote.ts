import { DataTypes, Model } from 'sequelize';
import sequelize from '../db';

class GardenNote extends Model {
  declare id: number;
  declare title: string;
  declare content: string;
  declare date: string;
  declare tags: string;
  declare isHidden: boolean;
}

GardenNote.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    date: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    tags: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    isHidden: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    sequelize,
    modelName: 'GardenNote',
  }
);

export default GardenNote;