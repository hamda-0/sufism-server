import type { Member } from "@prisma/client";
import reshttp from "reshttp";
import { db } from "../../configs/database.js";
import type { _Request } from "../../middleware/authMiddleware.js";
import { httpResponse } from "../../utils/apiResponseUtils.js";
import { asyncHandler } from "../../utils/asyncHandlerUtils.js";
import logger from "../../utils/loggerUtils.js";

export default {
  membership: asyncHandler(async (req: _Request, res) => {
    const data = req.body as Member;

    const user = await db.user.findFirst({
      where: {
        id: req.userFromToken?.id
      }
    });

    if (!user) {
      return httpResponse(req, res, reshttp.unauthorizedCode, reshttp.unauthorizedMessage);
    }
    const existingMember = await db.member.findFirst({
      where: {
        userId: user.id // Assuming `userId` is the foreign key in your member table
      }
    });
    if (existingMember) {
      return httpResponse(req, res, reshttp.conflictCode, "Membership already exists", existingMember);
    }
    // Create Member
    const member = await db.member.create({
      data: {
        user: {
          connect: { id: user.id }
        },
        // email:data.email,
        // fullName:data.fullName,
        phone: data.phone,
        country: data.country,
        agreedToPrinciples: data.agreedToPrinciples,
        consentedToUpdates: data.consentedToUpdates,
        additionalInfo: data.additionalInfo,
        collaboratorIntent: data.collaboratorIntent,
        donorType: data.donorType,
        intentCreation: data.intentCreation,
        monthlyTime: data.monthlyTime,
        organization: data.organization,
        previousVolunteerExp: data.previousVolunteerExp,
        roles: data.roles,
        volunteerMode: data.volunteerMode,
        volunteerSupport: data.volunteerSupport
      }
    });

    return httpResponse(req, res, reshttp.createdCode, "Membership created", member);
  }),
  viewMembership: asyncHandler(async (req: _Request, res) => {
    const userId = req.userFromToken?.id;
    const user = await db.user.findFirst({
      where: { id: userId }
    });
    if (!user) {
      logger.info("Unauthorize user");
      return httpResponse(req, res, reshttp.unauthorizedCode, reshttp.unauthorizedMessage);
    }
    const member = await db.member.findFirst({
      where: {
        userId: user.id
      }
    });
    if (!member) {
      logger.info("Membership not fount");
      return httpResponse(req, res, reshttp.notFoundCode, "Membership not found");
    }
    logger.info("Membership fetched");
    logger.info(member);
    return httpResponse(req, res, reshttp.acceptedCode, "Membership fetched", member);
  }),
  membershipUpdate: asyncHandler(async (req: _Request, res) => {
    const data = req.body as Partial<Member>;

    const user = await db.user.findFirst({
      where: {
        id: req.userFromToken?.id
      }
    });

    if (!user) {
      return httpResponse(req, res, reshttp.unauthorizedCode, reshttp.unauthorizedMessage);
    }

    const existingMember = await db.member.findFirst({
      where: {
        userId: user.id
      }
    });

    if (!existingMember) {
      return httpResponse(req, res, reshttp.notFoundCode, "Membership not found");
    }

    const updatedMember = await db.member.update({
      where: {
        id: existingMember.id
      },
      data: {
        phone: data.phone ?? existingMember.phone,
        country: data.country ?? existingMember.country,
        agreedToPrinciples: data.agreedToPrinciples ?? existingMember.agreedToPrinciples,
        consentedToUpdates: data.consentedToUpdates ?? existingMember.consentedToUpdates,
        additionalInfo: data.additionalInfo ?? existingMember.additionalInfo,
        collaboratorIntent: data.collaboratorIntent ?? existingMember.collaboratorIntent,
        donorType: data.donorType ?? existingMember.donorType,
        intentCreation: data.intentCreation ?? existingMember.intentCreation,
        monthlyTime: data.monthlyTime ?? existingMember.monthlyTime,
        organization: data.organization ?? existingMember.organization,
        previousVolunteerExp: data.previousVolunteerExp ?? existingMember.previousVolunteerExp,
        roles: data.roles ?? existingMember.roles,
        volunteerMode: data.volunteerMode ?? existingMember.volunteerMode,
        volunteerSupport: data.volunteerSupport ?? existingMember.volunteerSupport
      }
    });

    return httpResponse(req, res, reshttp.okCode, "Membership updated", updatedMember);
  }),
  membershipDelete: asyncHandler(async (req: _Request, res) => {
    const user = await db.user.findFirst({
      where: {
        id: req.userFromToken?.id
      }
    });

    if (!user) {
      return httpResponse(req, res, reshttp.unauthorizedCode, reshttp.unauthorizedMessage);
    }

    const existingMember = await db.member.findFirst({
      where: {
        userId: user.id
      }
    });

    if (!existingMember) {
      return httpResponse(req, res, reshttp.notFoundCode, "Membership not found");
    }

    // Delete the member
    await db.member.delete({
      where: {
        id: existingMember.id
      }
    });

    return httpResponse(req, res, reshttp.okCode, "Membership deleted successfully");
  })
};
