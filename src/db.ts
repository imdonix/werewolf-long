import { CreationOptional, DataTypes, Model, Sequelize } from "sequelize";

export const sequelize = new Sequelize('sqlite:dobabDB', {
    logging: false
});

/* Interfaces */

export interface AccountModel {
    id : string
    name : string
    password : string
    score : number
    invitedByAccountID : string
    effectInviteStatus : number
    effectWinStatus : number
}

/* Models */

export class Account extends Model<AccountModel>
{
    declare id : string
    declare name : string
    declare password : string
    declare score : CreationOptional<number>
    declare invitedByAccountID : CreationOptional<string>
    declare effectInviteStatus : CreationOptional<number>
    declare effectWinStatus : CreationOptional<number>
    declare createdAt: CreationOptional<Date>
    declare updatedAt: CreationOptional<Date>
}

/* Declarations */

Account.init({
    id : {
        type : DataTypes.STRING,
        primaryKey : true
    },
    name : {
        type : DataTypes.STRING,
    },
    password : {
        type : DataTypes.STRING,
    },
    score : {
        type : DataTypes.INTEGER,
        defaultValue : 0
    },
    invitedByAccountID : {
        type : DataTypes.STRING,
        allowNull : true        
    },
    effectInviteStatus : {
        type : DataTypes.INTEGER,
        defaultValue : 0
    },
    effectWinStatus : {
        type : DataTypes.INTEGER,
        defaultValue : 0
    }
},{
    sequelize
})