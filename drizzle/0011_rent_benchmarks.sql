CREATE TABLE `rent_benchmarks` (
  `zip` varchar(5) NOT NULL,
  `state` varchar(2) NOT NULL,
  `countyFips` varchar(5),
  `cbsaCode` varchar(5),
  `acsMedianRent` int,
  `acsMarginOfError` int,
  `acsSampleSize` int,
  `hudFmrStudio` int,
  `hudFmr1br` int,
  `hudFmr2br` int,
  `hudFmr3br` int,
  `hudFmr4br` int,
  `acsDataYear` int,
  `hudDataYear` int,
  `acsRefreshedAt` timestamp,
  `hudRefreshedAt` timestamp,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`zip`),
  KEY `idx_rent_benchmarks_state` (`state`),
  KEY `idx_rent_benchmarks_county` (`countyFips`),
  KEY `idx_rent_benchmarks_cbsa` (`cbsaCode`)
);--> statement-breakpoint
CREATE TABLE `rent_benchmark_history` (
  `id` int NOT NULL AUTO_INCREMENT,
  `zip` varchar(5) NOT NULL,
  `snapshotDate` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `source` enum('acs','hud','leasely') NOT NULL,
  `bedrooms` varchar(8),
  `rent` int NOT NULL,
  `sampleSize` int,
  `dataYear` int,
  PRIMARY KEY (`id`),
  KEY `idx_rent_history_zip_date` (`zip`, `snapshotDate`),
  KEY `idx_rent_history_source` (`source`, `snapshotDate`)
);--> statement-breakpoint
CREATE TABLE `rent_benchmark_runs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `source` enum('acs','hud','leasely') NOT NULL,
  `status` enum('running','success','failed') NOT NULL,
  `rowsUpserted` int NOT NULL DEFAULT 0,
  `errorMessage` text,
  `startedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `finishedAt` timestamp,
  PRIMARY KEY (`id`),
  KEY `idx_rent_runs_source_started` (`source`, `startedAt`)
);
