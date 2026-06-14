using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EventPlatform.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class RemoveUniqueConstraintFromRegistrations : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Registrations_UserId_TicketTypeId",
                table: "Registrations");

            migrationBuilder.CreateIndex(
                name: "IX_Registrations_UserId_TicketTypeId",
                table: "Registrations",
                columns: new[] { "UserId", "TicketTypeId" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Registrations_UserId_TicketTypeId",
                table: "Registrations");

            migrationBuilder.CreateIndex(
                name: "IX_Registrations_UserId_TicketTypeId",
                table: "Registrations",
                columns: new[] { "UserId", "TicketTypeId" },
                unique: true);
        }
    }
}
