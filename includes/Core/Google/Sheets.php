<?php

/**
 * Google Sheets API Client
 *
 * @package Gutenform\Core\Google
 * @since 1.0.0
 */

namespace Gutenform\Core\Google;

defined('ABSPATH') || exit;

/**
 * Google Sheets operations.
 */
class Sheets
{
	/**
	 * List spreadsheets from Google Drive.
	 *
	 * @param string $search Optional search query.
	 * @return array<int, array{id: string, name: string, modified_time: string}>
	 *
	 * @throws GoogleApiException When the request fails.
	 */
	public static function list_spreadsheets(string $search = ''): array
	{
		$query = "mimeType='application/vnd.google-apps.spreadsheet' and trashed=false";
		if ('' !== $search) {
			$query .= " and name contains '" . str_replace("'", "\\'", $search) . "'";
		}

		$url  = add_query_arg(
			array(
				'q'       => $query,
				'fields'  => 'files(id,name,modifiedTime)',
				'orderBy' => 'modifiedTime desc',
				'pageSize'=> 100,
			),
			'https://www.googleapis.com/drive/v3/files'
		);
		$data = Client::get($url);

		$files = isset($data['files']) && is_array($data['files']) ? $data['files'] : array();
		$out   = array();

		foreach ($files as $file) {
			if (empty($file['id']) || empty($file['name'])) {
				continue;
			}
			$out[] = array(
				'id'            => (string) $file['id'],
				'name'          => (string) $file['name'],
				'modified_time' => isset($file['modifiedTime']) ? (string) $file['modifiedTime'] : '',
			);
		}

		return $out;
	}

	/**
	 * Create a new spreadsheet.
	 *
	 * @param string $title Spreadsheet title.
	 * @return array{id: string, name: string, default_sheet: string}
	 *
	 * @throws GoogleApiException When the request fails.
	 */
	public static function create_spreadsheet(string $title): array
	{
		$data = Client::post(
			'https://sheets.googleapis.com/v4/spreadsheets',
			array(
				'properties' => array(
					'title' => $title,
				),
			)
		);

		if (empty($data['spreadsheetId'])) {
			throw new GoogleApiException(__('Failed to create spreadsheet.', 'gutenform'), 500, $data);
		}

		$default_sheet = 'Sheet1';
		if (! empty($data['sheets'][0]['properties']['title'])) {
			$default_sheet = (string) $data['sheets'][0]['properties']['title'];
		}

		return array(
			'id'            => (string) $data['spreadsheetId'],
			'name'          => isset($data['properties']['title']) ? (string) $data['properties']['title'] : $title,
			'default_sheet' => $default_sheet,
		);
	}

	/**
	 * List sheets (tabs) in a spreadsheet.
	 *
	 * @param string $spreadsheet_id Spreadsheet ID.
	 * @return array<int, array{id: int, name: string, index: int}>
	 *
	 * @throws GoogleApiException When the request fails.
	 */
	public static function list_sheets(string $spreadsheet_id): array
	{
		$url  = 'https://sheets.googleapis.com/v4/spreadsheets/' . rawurlencode($spreadsheet_id) . '?fields=sheets(properties(sheetId,title,index))';
		$data = Client::get($url);

		$sheets = isset($data['sheets']) && is_array($data['sheets']) ? $data['sheets'] : array();
		$out    = array();

		foreach ($sheets as $sheet) {
			$props = isset($sheet['properties']) && is_array($sheet['properties']) ? $sheet['properties'] : array();
			if (empty($props['title'])) {
				continue;
			}
			$out[] = array(
				'id'    => isset($props['sheetId']) ? (int) $props['sheetId'] : 0,
				'name'  => (string) $props['title'],
				'index' => isset($props['index']) ? (int) $props['index'] : 0,
			);
		}

		usort(
			$out,
			static function ($a, $b) {
				return $a['index'] <=> $b['index'];
			}
		);

		return $out;
	}

	/**
	 * Get header row from a sheet.
	 *
	 * @param string $spreadsheet_id Spreadsheet ID.
	 * @param string $sheet_name     Sheet tab name.
	 * @return array<int, string>
	 *
	 * @throws GoogleApiException When the request fails.
	 */
	public static function get_headers(string $spreadsheet_id, string $sheet_name): array
	{
		$range = self::sheet_range($sheet_name, '1:1');
		$url   = sprintf(
			'https://sheets.googleapis.com/v4/spreadsheets/%s/values/%s',
			rawurlencode($spreadsheet_id),
			rawurlencode($range)
		);

		$data = Client::get($url);
		if (empty($data['values'][0]) || ! is_array($data['values'][0])) {
			return array();
		}

		return array_map('strval', $data['values'][0]);
	}

	/**
	 * Create a new sheet tab with optional header row.
	 *
	 * @param string        $spreadsheet_id Spreadsheet ID.
	 * @param string        $sheet_name     New sheet name.
	 * @param array<string> $headers        Optional header row.
	 * @return array{id: int, name: string}
	 *
	 * @throws GoogleApiException When the request fails.
	 */
	public static function create_sheet(string $spreadsheet_id, string $sheet_name, array $headers = array()): array
	{
		$data = Client::post(
			'https://sheets.googleapis.com/v4/spreadsheets/' . rawurlencode($spreadsheet_id) . ':batchUpdate',
			array(
				'requests' => array(
					array(
						'addSheet' => array(
							'properties' => array(
								'title' => $sheet_name,
							),
						),
					),
				),
			)
		);

		$sheet_id   = 0;
		$created    = $sheet_name;
		$replies    = isset($data['replies']) && is_array($data['replies']) ? $data['replies'] : array();
		if (! empty($replies[0]['addSheet']['properties'])) {
			$props    = $replies[0]['addSheet']['properties'];
			$sheet_id = isset($props['sheetId']) ? (int) $props['sheetId'] : 0;
			$created  = isset($props['title']) ? (string) $props['title'] : $sheet_name;
		}

		if (! empty($headers)) {
			self::set_headers($spreadsheet_id, $created, $headers);
		}

		return array(
			'id'   => $sheet_id,
			'name' => $created,
		);
	}

	/**
	 * Set header row on a sheet.
	 *
	 * @param string        $spreadsheet_id Spreadsheet ID.
	 * @param string        $sheet_name     Sheet tab name.
	 * @param array<string> $headers        Header values.
	 * @return void
	 *
	 * @throws GoogleApiException When the request fails.
	 */
	public static function set_headers(string $spreadsheet_id, string $sheet_name, array $headers): void
	{
		if (empty($headers)) {
			return;
		}

		$range = self::sheet_range($sheet_name, '1:1');
		$url   = add_query_arg(
			array('valueInputOption' => 'USER_ENTERED'),
			sprintf(
				'https://sheets.googleapis.com/v4/spreadsheets/%s/values/%s',
				rawurlencode($spreadsheet_id),
				rawurlencode($range)
			)
		);

		Client::put(
			$url,
			array(
				'values' => array(array_values($headers)),
			)
		);
	}

	/**
	 * Append a row to a sheet.
	 *
	 * @param string           $spreadsheet_id Spreadsheet ID.
	 * @param string           $sheet_name     Sheet tab name.
	 * @param array<int,mixed> $row            Row values.
	 * @return array<string, mixed>
	 *
	 * @throws GoogleApiException When the request fails.
	 */
	public static function append_row(string $spreadsheet_id, string $sheet_name, array $row): array
	{
		$range = self::sheet_range($sheet_name, 'A:Z');
		$url   = add_query_arg(
			array(
				'valueInputOption'  => 'USER_ENTERED',
				'insertDataOption'  => 'INSERT_ROWS',
			),
			sprintf(
				'https://sheets.googleapis.com/v4/spreadsheets/%s/values/%s:append',
				rawurlencode($spreadsheet_id),
				rawurlencode($range)
			)
		);

		return Client::post(
			$url,
			array(
				'values' => array(array_values($row)),
			)
		);
	}

	/**
	 * Build A1 range notation for a sheet.
	 *
	 * @param string $sheet_name Sheet name.
	 * @param string $range      Cell range.
	 * @return string
	 */
	public static function sheet_range(string $sheet_name, string $range): string
	{
		$escaped = str_replace("'", "''", $sheet_name);
		return "'{$escaped}'!{$range}";
	}
}
