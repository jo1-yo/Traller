"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EntityRelationshipSchema = exports.EntityRelationship = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let EntityRelationship = class EntityRelationship {
    _id;
    queryResultId;
    entityId;
    name;
    tag;
    avatarUrl;
    relationshipScore;
    summary;
    description;
    links;
};
exports.EntityRelationship = EntityRelationship;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'QueryResult', required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], EntityRelationship.prototype, "queryResultId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], EntityRelationship.prototype, "entityId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, maxlength: 255 }),
    __metadata("design:type", String)
], EntityRelationship.prototype, "name", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, maxlength: 50 }),
    __metadata("design:type", String)
], EntityRelationship.prototype, "tag", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], EntityRelationship.prototype, "avatarUrl", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 1, min: 1, max: 10 }),
    __metadata("design:type", Number)
], EntityRelationship.prototype, "relationshipScore", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], EntityRelationship.prototype, "summary", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], EntityRelationship.prototype, "description", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], EntityRelationship.prototype, "links", void 0);
exports.EntityRelationship = EntityRelationship = __decorate([
    (0, mongoose_1.Schema)({
        collection: 'entity_relationships',
        timestamps: true,
    })
], EntityRelationship);
exports.EntityRelationshipSchema = mongoose_1.SchemaFactory.createForClass(EntityRelationship);
//# sourceMappingURL=entity-relationship.entity.js.map