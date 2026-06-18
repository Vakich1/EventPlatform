using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EventPlatform.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddOrganizerApproval : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsApprovedOrganizer",
                table: "Users",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "OrganizerApprovedAt",
                table: "Users",
                type: "timestamp with time zone",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsApprovedOrganizer",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "OrganizerApprovedAt",
                table: "Users");
        }
    }
}
