INSERT INTO `menu` (`id`, `path`, `name`, `component`, `redirect`, `metaId`, `parentId`) VALUES (1, '/manager', 'manager', 'LAYOUT', '/manager/user', 1, NULL);
INSERT INTO `menu` (`id`, `path`, `name`, `component`, `redirect`, `metaId`, `parentId`) VALUES (2, 'user', 'userList', '/manager/user/index', NULL, 2, 1);
INSERT INTO `menu` (`id`, `path`, `name`, `component`, `redirect`, `metaId`, `parentId`) VALUES (3, '/meeting', 'meeting', 'LAYOUT', '/meeting/booking', 3, NULL);
INSERT INTO `menu` (`id`, `path`, `name`, `component`, `redirect`, `metaId`, `parentId`) VALUES (4, 'meeting', 'MeetingList', '/manager/meeting/index', NULL, 4, 1);
INSERT INTO `menu` (`id`, `path`, `name`, `component`, `redirect`, `metaId`, `parentId`) VALUES (5, 'booking', 'BookingList', '/manager/booking/index', NULL, 5, 1);
INSERT INTO `menu` (`id`, `path`, `name`, `component`, `redirect`, `metaId`, `parentId`) VALUES (6, 'department', 'DepartmentList', '/manager/department/index', NULL, 6, 1);
INSERT INTO `menu` (`id`, `path`, `name`, `component`, `redirect`, `metaId`, `parentId`) VALUES (7, 'menu', 'MenuList', '/manager/menu/index', NULL, 7, 1);
INSERT INTO `menu` (`id`, `path`, `name`, `component`, `redirect`, `metaId`, `parentId`) VALUES (8, 'booking', 'Booking', '/meeting/booking/index', '', 8, 3);
INSERT INTO `menu` (`id`, `path`, `name`, `component`, `redirect`, `metaId`, `parentId`) VALUES (9, 'record', 'Record', '/meeting/record/index', '', 9, 3);
INSERT INTO `menu` (`id`, `path`, `name`, `component`, `redirect`, `metaId`, `parentId`) VALUES (10, '/notic', 'notic', 'LAYOUT', '', 10, NULL);
INSERT INTO `menu` (`id`, `path`, `name`, `component`, `redirect`, `metaId`, `parentId`) VALUES (11, 'mail', 'Mail', '/notic/mail/index', '', 11, 10);
