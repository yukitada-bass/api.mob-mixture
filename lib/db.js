import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function insertUserState(userId, tickets) {
  return prisma.userState.upsert({
    where: { userId },
    create: { userId, tickets },
    update: { tickets },
  });
}

export async function updateUserState(number, step, userId) {
  return prisma.userState.update({
    where: { userId },
    data: { number, step },
  });
}

export async function selectUserState(userId) {
  return prisma.userState.findUnique({
    where: { userId },
    select: { step: true },
  });
}

export async function selectSchedule() {
  return prisma.userState.findMany({
    select: { tickets: true },
  });
}

export async function getTickets(tickets) {
  return prisma.userState.findMany({
    where: { tickets },
  });
}

export async function listTShirtStock() {
  return prisma.tShirtStock.findMany({
    orderBy: { size: "asc" },
  });
}

export async function setTShirtStock(size, stock) {
  return prisma.tShirtStock.upsert({
    where: { size },
    create: { size, stock },
    update: { stock },
  });
}

export async function addTShirtStock(size, amount) {
  return prisma.tShirtStock.upsert({
    where: { size },
    create: { size, stock: amount },
    update: { stock: { increment: amount } },
  });
}

export async function changeTShirtStock(size, delta) {
  const record = await prisma.tShirtStock.findUnique({
    where: { size },
  });
  if (!record) {
    throw new Error("指定されたサイズの在庫が存在しません");
  }
  const nextStock = record.stock + delta;
  if (nextStock < 0) {
    throw new Error("在庫が不足しています");
  }
  return prisma.tShirtStock.update({
    where: { size },
    data: { stock: nextStock },
  });
}

export async function reserveTShirt(size, quantity) {
  return changeTShirtStock(size, -quantity);
}
