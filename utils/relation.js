const { SubChildHeader, Technology, Field, User } = require("../models/index");
const CaseStudy = require("../models/caseStudy");
const Feedback = require("../models/feedback");
const Header = require("../models/header");
const Industry = require("../models/Industry");
const SubHeader = require("../models/subHeader");
const Service = require("../models/service");
const ServiceFaq = require("../models/ServiceFaq");
const SubServices = require("../models/SubServices");
const ServiceDetails = require('../models/serviceDetails');
const UserQuestions = require('../models/userQustions');
const IndustryPage = require('../models/IndustryPage');

exports.relation = () => {
  Header.hasMany(SubHeader, { foreignKey: "headerId", onDelete: "CASCADE" });
  SubHeader.belongsTo(Header, { foreignKey: "headerId", onDelete: "CASCADE" });

  SubHeader.hasMany(SubChildHeader, {
    foreignKey: "subHeaderId",
    onDelete: "CASCADE",
    as: "menuHeaders",
  });

  SubChildHeader.belongsTo(SubHeader, {
    foreignKey: "subHeaderId",
    onDelete: "CASCADE",
    as: "parentSubHeader",
  });

  Industry.hasMany(CaseStudy, {
    foreignKey: "industryId",
    as: "caseStudies",
    onDelete: "CASCADE",
  });
  CaseStudy.belongsTo(Industry, {
    foreignKey: "industryId",
    as: "industry",
    onDelete: "CASCADE",
  });

  Service.hasMany(ServiceFaq, {
    foreignKey: "service_id",
    onDelete: "CASCADE",
  });
  ServiceFaq.belongsTo(Service, {
    foreignKey: "service_id",
    onDelete: "CASCADE",
  });

  Service.hasMany(SubServices, {
    foreignKey: "service_id",
    onDelete: "CASCADE",
  });
  SubServices.belongsTo(Service, {
    foreignKey: "service_id",
    onDelete: "CASCADE",
  });

  // Service and ServiceDetails relationship (one-to-one)
  Service.hasOne(ServiceDetails, {
    foreignKey: "service_id",
    onDelete: "CASCADE",
  });
  ServiceDetails.belongsTo(Service, {
    foreignKey: "service_id",
    onDelete: "CASCADE",
  });
  // Add ServiceDetails and SubServices relationship
  ServiceDetails.belongsToMany(SubServices, {
    through: "service_details_sub_services",
    foreignKey: "service_detail_id",
    otherKey: "sub_service_id"
  });
  
  SubServices.belongsToMany(ServiceDetails, {
    through: "service_details_sub_services",
    foreignKey: "sub_service_id",
    otherKey: "service_detail_id"
  });

  // Field and Service relationship
  Field.hasMany(Service, {
    foreignKey: "field_id",
    onDelete: "SET NULL"
  });
  Service.belongsTo(Field, {
    foreignKey: "field_id",
    onDelete: "SET NULL"
  });

  // Replace the existing Industry-IndustryPage relationship with:
  Industry.hasOne(IndustryPage, {
    foreignKey: "industry_id",
    onDelete: "CASCADE"
  });
  IndustryPage.belongsTo(Industry, {
    foreignKey: "industry_id",
    onDelete: "CASCADE"
  });

  User.hasMany(UserQuestions, {
    foreignKey: "userId",
    onDelete: "CASCADE"
  });
  UserQuestions.belongsTo(User, {
    foreignKey: "userId",
    onDelete: "CASCADE"
  });
};
