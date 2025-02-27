// const { Sequelize } = require('sequelize');
// const sequelize = require('../config/db');
// const db = {};
// db.sequelize = sequelize;
// db.Sequelize = Sequelize;
// db.NavbarLink = require('./NavLink');
// db.Sublink = require('./Sublinks');
// db.SublinkMenu = require('./SubLinksMenu')
// db.Section = require('./Section');
// db.SectionHeading = require('./Sectionheading');
// db.SectionList = require('./SectionlistItem');
// db.SectionImages = require('./SectionImage')
// db.SocialMedia = require('./socialMedia')
// db.Branch = require('./Branches')
// module.exports = db;

const User = require("./userModel");


module.exports = {
  Service: require("./service"),
  ServiceFaq: require("./ServiceFaq"),
  SubServices: require("./SubServices"),
  ServiceDetails: require("./serviceDetails"),
  Industry: require("./Industry"),
  Branch: require("./branch"), //pages
  Technology: require("./technology"),
  SocialMedia: require("./SocialMedia"),
  Banner: require("./banner"),
  Blog: require("./blog"),
  User: User,
  OurClient: require("./ourClients"),
  Certificate: require("./certificate"),
  Feedback: require("./feedback"), //pages
  CaseStudy: require("./caseStudy"), //industry
  Header: require("./header"),
  IndustryPage: require('./IndustryPage'),
  SubHeader: require("./subHeader"),
  SubChildHeader: require("./subChildHeader"),
  Field: require('./field'),
  Steps: require('./Steps'),
  UserQuestions: require('./userQustions')
};
