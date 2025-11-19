`<!DOCTYPE html>
<html>
	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1.0" />
		<title>Yeni Değişiklikler</title>
	</head>
	<body
		style="
			margin: 0;
			padding: 0;
			background-color: #ffffff;
			font-family: Arial, Helvetica, sans-serif;
		"
	>
		<table
			width="100%"
			cellpadding="0"
			cellspacing="0"
			border="0"
			style="background-color: #ffffff"
		>
			<tr>
				<td align="center">
					<table
						width="600"
						cellpadding="0"
						cellspacing="0"
						border="0"
						style="
							width: 600px;
							max-width: 600px;
							border: 12px solid #42525e;
							background-color: #ffffff;
							border-radius: 18px;
						"
					>
						<!-- Header -->
						<tr>
							<td
								align="center"
								style="background-color: #d4d4d4; padding: 16px 0 12px 0"
							>
								<img
									src="https://raw.githubusercontent.com/alpbayram/todeb-mail/refs/heads/main/TODEB_Logo.png"
									alt="TODEB Logo"
									width="280"
									height="auto"
									style="
										display: block;
										border: none;
										outline: none;
										text-decoration: none;
									"
								/>
							</td>
						</tr>
						<tr>
							<td
								align="center"
								style="background-color: #d4d4d4; padding: 8px 24px 12px 24px"
							>								
								${metaName ? `
								<p
									style="
										margin: 0;
										font-size: 24px;
										font-weight: bold;
										color: #000000;
									"
								>
									${metaName}
								</p>
								` : ''} ${metaUri ? `
								<p style="margin: 4px 0 0 0; font-size: 12px">
									<a
										href="${metaUri}"
										style="color: #1d4ed8; text-decoration: underline"
									>
										Siteye gitmek için tıklayınız
									</a>
								</p>
								` : ''}
							</td>
						</tr>

						<!-- Spacer -->
						<tr>
							<td height="24" style="font-size: 0; line-height: 0">&nbsp;</td>
						</tr>

						<!-- YENİ EKLENENLER -->
						<tr>
							<td style="padding: 0 24px 16px 24px">
								<table width="100%" cellpadding="0" cellspacing="0" border="0">
									<tr>
										<td
											style="
												font-size: 18px;
												font-weight: bold;
												color: #000000;
												padding-bottom: 8px;
											"
										>
											Yeni Eklenenler
										</td>
									</tr>
									<tr>
										<td
											style="
												border: 2px solid #b0b0b0;
												padding: 0;
												font-size: 14px;
												color: #405464;
											"
										>
											<table
												width="100%"
												cellpadding="0"
												cellspacing="0"
												border="0"
												style="border-collapse: collapse"
											>
												<thead>
													<tr>
														<th
															align="left"
															style="
																padding: 8px;
																border-bottom: 1px solid #b0b0b0;
																font-size: 13px;
																font-weight: bold;
																background-color: #42525e;
																color: white;
																width: 100px;
															"
														>
															Kuruluş Kodu
														</th>
														<th
															align="left"
															style="
																padding: 8px;
																border-bottom: 1px solid #b0b0b0;
																font-size: 13px;
																font-weight: bold;
																background-color: #42525e;
																color: white;
															"
														>
															Kuruluş Adı
														</th>
														<th
															align="left"
															style="
																padding: 8px;
																border-bottom: 1px solid #b0b0b0;
																font-size: 13px;
																font-weight: bold;
																background-color: #42525e;
																color: white;
															"
														>
															Yetkileri
														</th>
													</tr>
												</thead>
												<tbody>
													${addedRows}
												</tbody>
											</table>
										</td>
									</tr>
								</table>
							</td>
						</tr>

						<!-- SİLİNENLER -->
						<tr>
							<td style="padding: 0 24px 16px 24px">
								<table width="100%" cellpadding="0" cellspacing="0" border="0">
									<tr>
										<td
											style="
												font-size: 18px;
												font-weight: bold;
												color: #000000;
												padding-bottom: 8px;
											"
										>
											Silinenler
										</td>
									</tr>
									<tr>
										<td
											style="
												border: 2px solid #b0b0b0;
												padding: 0;
												font-size: 14px;
												color: #405464;
											"
										>
											<table
												width="100%"
												cellpadding="0"
												cellspacing="0"
												border="0"
												style="border-collapse: collapse"
											>
												<thead>
													<tr>
														<th
															align="left"
															style="
																padding: 8px;
																border-bottom: 1px solid #b0b0b0;
																font-size: 13px;
																font-weight: bold;
																background-color: #42525e;
																color: white;
																width: 100px;
															"
														>
															Kuruluş Kodu
														</th>
														<th
															align="left"
															style="
																padding: 8px;
																border-bottom: 1px solid #b0b0b0;
																font-size: 13px;
																font-weight: bold;
																background-color: #42525e;
																color: white;
															"
														>
															Kuruluş Adı
														</th>
														<th
															align="left"
															style="
																padding: 8px;
																border-bottom: 1px solid #b0b0b0;
																font-size: 13px;
																font-weight: bold;
																background-color: #42525e;
																color: white;
															"
														>
															Yetkileri
														</th>
													</tr>
												</thead>
												<tbody>
													${removedRows}
												</tbody>
											</table>
										</td>
									</tr>
								</table>
							</td>
						</tr>

						<!-- DEĞİŞENLER -->
						<tr>
							<td style="padding: 0 24px 24px 24px">
								<table width="100%" cellpadding="0" cellspacing="0" border="0">
									<tr>
										<td
											style="
												font-size: 18px;
												font-weight: bold;
												color: #000000;
												padding-bottom: 8px;
											"
										>
											Değişenler
										</td>
									</tr>
									<tr>
										<td
											style="
												border: 2px solid #b0b0b0;
												padding: 0;
												font-size: 14px;
												color: #405464;
											"
										>
											<table
												width="100%"
												cellpadding="0"
												cellspacing="0"
												border="0"
												style="border-collapse: collapse"
											>
												<thead>
													<tr>
														<th
															align="left"
															style="
																padding: 8px;
																border-bottom: 1px solid #b0b0b0;
																font-size: 13px;
																font-weight: bold;
																background-color: #42525e;
																color: white;
																width: 100px;
															"
														>
															Kuruluş Kodu
														</th>
														<th
															align="left"
															style="
																padding: 8px;
																border-bottom: 1px solid #b0b0b0;
																font-size: 13px;
																font-weight: bold;
																background-color: #42525e;
																color: white;
															"
														>
															Kuruluş Adı
														</th>
														<th
															align="left"
															style="
																padding: 8px;
																border-bottom: 1px solid #b0b0b0;
																font-size: 13px;
																font-weight: bold;
																background-color: #42525e;
																color: white;
															"
														>
															Yetkileri
														</th>
													</tr>
												</thead>
												<tbody>
													${changedRows}
												</tbody>
											</table>
										</td>
									</tr>
								</table>
							</td>
						</tr>

						<!-- Footer -->
						<tr>
							<td
								align="center"
								style="
									background-color: #f0f0f0;
									padding: 12px;
									font-size: 12px;
									color: #666666;
								"
							>
								${metaTs}
							</td>
						</tr>
					</table>
				</td>
			</tr>
		</table>
	</body>
</html>`
