import { DataTypes, Model } from 'sequelize';
import sequelize from '../db';

class Article extends Model {
  declare id: number;
  declare title: string;
  declare summary: string;
  declare content: string;
  declare aiAnalysis: string | null;
  declare date: string;
  declare category: string;
  declare sourceUrl: string | null;
  declare attachmentUrl: string | null;
  declare isHidden: boolean;
}

Article.init(
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
    summary: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    aiAnalysis: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    date: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    sourceUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    attachmentUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    isHidden: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    sequelize,
    modelName: 'Article',
  }
);

export default Article;
