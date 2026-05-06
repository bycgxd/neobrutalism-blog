import { DataTypes, Model } from 'sequelize';
import sequelize from '../db';

class PageView extends Model {
  declare id: number;
  declare ip: string;
  declare country: string;
  declare city: string;
  declare page: string;
  declare articleId: number | null;
  declare visitorId: string;
  declare userAgent: string | null;
}

PageView.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    ip: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    country: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'Unknown',
    },
    city: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'Unknown',
    },
    page: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    articleId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    visitorId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    userAgent: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'PageView',
  }
);

export default PageView;
