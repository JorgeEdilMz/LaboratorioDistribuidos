-- CreateTable
CREATE TABLE `tipo_documentos` (
    `id_tipo_documento` INTEGER NOT NULL,
    `tipo_documento` CHAR(2) NOT NULL,

    PRIMARY KEY (`id_tipo_documento`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `usuarios` (
    `documento_usuario` INTEGER UNSIGNED NOT NULL,
    `tipo_documento_usuario` INTEGER NOT NULL DEFAULT 1,
    `nombre_usuario` VARCHAR(20) NOT NULL,
    `apellido_usuario` VARCHAR(20) NOT NULL,
    `celular_usuario` VARCHAR(24) NOT NULL,
    `fecha_registro_usuario` DATE NOT NULL,
    `estado_usuario` CHAR(1) NULL DEFAULT 'A',
    `direccion_usuario` VARCHAR(200) NULL,
    `fecha_nacimiento_usuario` DATE NULL,
    `foto_usuario` VARCHAR(200) NULL,

    INDEX `tipo_documento_usuario`(`tipo_documento_usuario`),
    PRIMARY KEY (`documento_usuario`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `usuarios_roles` (
    `id_usuario` INTEGER UNSIGNED NOT NULL,
    `id_rol` INTEGER NOT NULL,
    `nick_usuario` VARCHAR(40) NOT NULL,
    `password_usuario` VARCHAR(255) NOT NULL,

    UNIQUE INDEX `nick_usuario`(`nick_usuario`),
    INDEX `id_rol`(`id_rol`),
    PRIMARY KEY (`id_usuario`, `id_rol`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `roles` (
    `id_rol` INTEGER NOT NULL,
    `nombre_rol` VARCHAR(20) NOT NULL,
    `fecha_creacion_rol` DATETIME(0) NOT NULL,
    `estado_rol` CHAR(1) NULL DEFAULT 'A',
    `descripcion_rol` VARCHAR(100) NULL,
    `numero_personas_roles` INTEGER NULL DEFAULT 0,

    PRIMARY KEY (`id_rol`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `email` (
    `my_row_id` BIGINT UNSIGNED NOT NULL,
    `fecha_consulta` DATE NOT NULL,

    PRIMARY KEY (`my_row_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `usuarios` ADD CONSTRAINT `usuarios_ibfk_1` FOREIGN KEY (`tipo_documento_usuario`) REFERENCES `tipo_documentos`(`id_tipo_documento`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `usuarios_roles` ADD CONSTRAINT `usuarios_roles_ibfk_2` FOREIGN KEY (`id_rol`) REFERENCES `roles`(`id_rol`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `usuarios_roles` ADD CONSTRAINT `usuarios_roles_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios`(`documento_usuario`) ON DELETE NO ACTION ON UPDATE NO ACTION;
