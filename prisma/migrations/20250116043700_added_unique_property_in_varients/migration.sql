/*
  Warnings:

  - A unique constraint covering the columns `[option1,option2,option3]` on the table `Varients` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Varients_option1_option2_option3_key" ON "Varients"("option1", "option2", "option3");
