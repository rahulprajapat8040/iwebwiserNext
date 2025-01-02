const { SubChildHeader } = require("../models");
const CaseStudy = require("../models/caseStudy");
const Feedback = require("../models/feedback");
const Header = require("../models/header");
const Industry = require("../models/Industry");
const SubHeader = require("../models/subHeader");
const Service = require("../models/service");
const ServiceFaq = require("../models/ServiceFaq");
const SubServices = require("../models/SubServices");
const ServiceDetails = require('../models/serviceDetails')

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

  // Industry and Service relationship
  Service.hasMany(Industry, {
    foreignKey: "service_id",
    onDelete: "SET NULL"
  });
  Industry.belongsTo(Service, {
    foreignKey: "service_id",
    onDelete: "SET NULL"
  });

  // Remove all ServiceDetailsSubServices related code
};
